"""The matching engine.

Instead of blasting every donor in the city (which is how WhatsApp forwards burn out donors),
BloodLink notifies in *waves*: a small, ranked set of the best donors close by first, then widens
the radius only if not enough people have said yes. Each wave is a Celery task that schedules the
next one, so a request keeps working on its own until it is covered, cancelled, or expires.
"""
from dataclasses import dataclass
from datetime import timedelta
import logging

from django.conf import settings
from django.contrib.gis.db.models.functions import Distance
from django.contrib.gis.measure import D
from django.db import transaction
from django.db.models import F
from django.utils import timezone

from apps.core.blood import compatible_donor_groups
from apps.donors.models import DonorProfile

from .models import BloodRequest, DonorMatch, RequestEvent

log = logging.getLogger("bloodlink")


@dataclass(frozen=True)
class WavePlan:
    radii_km: tuple[int, ...]
    interval_seconds: int
    donors_per_unit: int


WAVE_PLANS = {
    BloodRequest.Urgency.CRITICAL: WavePlan((5, 10, 25, 50), 180, 6),
    BloodRequest.Urgency.URGENT: WavePlan((5, 15, 30, 50), 600, 4),
    BloodRequest.Urgency.PLANNED: WavePlan((10, 25, 50), 3600, 3),
}


@dataclass
class Candidate:
    donor: DonorProfile
    distance_km: float
    score: float


def score_candidate(donor: DonorProfile, distance_km: float, request: BloodRequest, preferred: list[str]) -> float:
    """Higher is better. Distance dominates; exact blood-group match and reliability break ties."""
    rank = preferred.index(donor.blood_group) if donor.blood_group in preferred else len(preferred)
    group_bonus = max(0, 20 - rank * 5)  # exact match +20, next best +15 ...
    reliability_bonus = 25 * donor.reliability
    distance_penalty = distance_km * (3 if request.urgency == BloodRequest.Urgency.CRITICAL else 1.5)
    return round(100 + group_bonus + reliability_bonus - distance_penalty, 2)


def find_candidates(request: BloodRequest, radius_km: float, limit: int | None = None) -> list[Candidate]:
    groups = compatible_donor_groups(request.blood_group, request.component)
    cooldown = settings.BLOODLINK["DONATION_COOLDOWN_DAYS"]
    notify_cooldown = timezone.now() - timedelta(hours=settings.BLOODLINK["NOTIFY_COOLDOWN_HOURS"])
    already = request.matches.values_list("donor_id", flat=True)

    qs = (
        DonorProfile.objects.select_related("user")
        .filter(
            is_available=True,
            blood_group__in=groups,
            location__dwithin=(request.location, D(km=radius_km)),
            user__is_active=True,
        )
        .exclude(id__in=already)
        .exclude(last_donation_date__gt=timezone.localdate() - timedelta(days=cooldown))
        # A donor already on the way to another patient shouldn't be pinged again.
        .exclude(matches__status__in=[DonorMatch.Status.ACCEPTED, DonorMatch.Status.ARRIVED])
        .annotate(distance=Distance("location", request.location))
        .order_by("distance")
    )
    if request.urgency != BloodRequest.Urgency.CRITICAL:
        qs = qs.exclude(last_notified_at__gt=notify_cooldown)

    out = []
    for donor in qs[:500]:
        km = donor.distance.km
        if km > donor.max_travel_km and request.urgency != BloodRequest.Urgency.CRITICAL:
            continue
        if not donor.is_eligible:
            continue
        out.append(Candidate(donor, round(km, 2), score_candidate(donor, km, request, groups)))
    out.sort(key=lambda c: c.score, reverse=True)
    return out[:limit] if limit else out


def units_still_needed(request: BloodRequest) -> int:
    return max(0, request.units_needed - request.units_pledged)


@transaction.atomic
def run_wave(request: BloodRequest) -> list[DonorMatch]:
    """Notify the next wave of donors. Returns the created matches (empty if nothing to do)."""
    request = BloodRequest.objects.select_for_update().get(pk=request.pk)
    if request.status != BloodRequest.Status.OPEN:
        return []
    needed = units_still_needed(request)
    if needed == 0:
        return []

    plan = WAVE_PLANS[request.urgency]
    wave_index = min(request.current_wave, len(plan.radii_km) - 1)
    radius = plan.radii_km[wave_index]
    # Count donors who were notified but haven't answered yet: no need to over-notify.
    pending = request.matches.filter(status=DonorMatch.Status.NOTIFIED).count()
    budget = max(needed * plan.donors_per_unit - pending, needed)

    candidates = find_candidates(request, radius, limit=budget)
    matches = [
        DonorMatch(request=request, donor=c.donor, wave=request.current_wave + 1, distance_km=c.distance_km, score=c.score)
        for c in candidates
    ]
    DonorMatch.objects.bulk_create(matches)
    now = timezone.now()
    DonorProfile.objects.filter(id__in=[c.donor.id for c in candidates]).update(
        last_notified_at=now, alerts_received=F("alerts_received") + 1
    )

    request.current_wave += 1
    request.search_radius_km = radius
    request.save(update_fields=["current_wave", "search_radius_km", "updated_at"])
    RequestEvent.objects.create(
        request=request,
        kind="WAVE",
        message=(
            f"Wave {request.current_wave}: alerted {len(matches)} compatible donors within {radius} km"
            if matches else f"Wave {request.current_wave}: no new eligible donors within {radius} km — widening search"
        ),
    )
    log.info("request %s wave %s notified %s donors", request.code, request.current_wave, len(matches))
    return list(DonorMatch.objects.filter(request=request, wave=request.current_wave).select_related("donor__user"))


def has_more_waves(request: BloodRequest) -> bool:
    plan = WAVE_PLANS[request.urgency]
    return request.current_wave < len(plan.radii_km) + 2  # last radius is retried twice for new sign-ups

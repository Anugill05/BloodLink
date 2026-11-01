from datetime import timedelta

from celery import shared_task
from django.utils import timezone

from apps.notifications.models import Notification
from apps.notifications.tasks import notify

from .matching import WAVE_PLANS, has_more_waves, run_wave, units_still_needed
from .models import BloodRequest, RequestEvent


def _alert_text(req, match):
    urgency = {"CRITICAL": "URGENT", "URGENT": "Today", "PLANNED": "Planned"}[req.urgency]
    return (
        f"{urgency}: {req.blood_group} needed near you",
        f"{req.get_component_display()} at {req.hospital.name} ({match.distance_km:.1f} km). "
        f"Can you help? Tap to respond — the family will only see your number if you accept.",
    )


@shared_task
def run_matching_wave(request_id: str):
    try:
        req = BloodRequest.objects.select_related("hospital").get(pk=request_id)
    except BloodRequest.DoesNotExist:
        return
    matches = run_wave(req)
    for m in matches:
        title, body = _alert_text(req, m)
        notify(m.donor.user, Notification.Kind.DONOR_ALERT, title, body, link=f"/donor?match={m.id}")

    req.refresh_from_db()
    if req.status == BloodRequest.Status.OPEN and units_still_needed(req) > 0:
        if has_more_waves(req):
            run_matching_wave.apply_async((request_id,), countdown=WAVE_PLANS[req.urgency].interval_seconds)
        elif not matches:
            RequestEvent.objects.create(
                request=req, kind="EXHAUSTED",
                message="No more eligible donors within 50 km. Hospital blood bank has been flagged.",
            )


@shared_task
def expire_stale_requests():
    cutoff = timezone.now() - timedelta(hours=6)
    stale = BloodRequest.objects.filter(
        status__in=[BloodRequest.Status.OPEN, BloodRequest.Status.PENDING], needed_by__lt=cutoff
    )
    count = 0
    for req in stale:
        req.status = BloodRequest.Status.EXPIRED
        req.save(update_fields=["status", "updated_at"])
        RequestEvent.objects.create(request=req, kind="EXPIRED", message="Request expired")
        count += 1
    return count

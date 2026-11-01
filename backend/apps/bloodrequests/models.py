import secrets
import uuid

from django.conf import settings
from django.contrib.gis.db import models

from apps.core.blood import BloodGroup, Component


def _short_code():
    alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    return "BL-" + "".join(secrets.choice(alphabet) for _ in range(5))


class BloodRequest(models.Model):
    class Urgency(models.TextChoices):
        CRITICAL = "CRITICAL", "Critical (within hours)"
        URGENT = "URGENT", "Urgent (within 24h)"
        PLANNED = "PLANNED", "Planned (surgery / transfusion)"

    class Status(models.TextChoices):
        PENDING = "PENDING_VERIFICATION", "Awaiting hospital verification"
        OPEN = "OPEN", "Searching for donors"
        FULFILLED = "FULFILLED", "Fulfilled"
        CANCELLED = "CANCELLED", "Cancelled"
        EXPIRED = "EXPIRED", "Expired"
        REJECTED = "REJECTED", "Rejected by hospital"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=10, unique=True, default=_short_code, editable=False)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL, related_name="blood_requests")
    hospital = models.ForeignKey("hospitals.Hospital", on_delete=models.PROTECT, related_name="requests")

    patient_name = models.CharField(max_length=120)
    patient_age = models.PositiveSmallIntegerField(null=True, blank=True)
    blood_group = models.CharField(max_length=3, choices=BloodGroup.choices)
    component = models.CharField(max_length=12, choices=Component.choices, default=Component.WHOLE_BLOOD)
    units_needed = models.PositiveSmallIntegerField(default=1)
    units_fulfilled = models.PositiveSmallIntegerField(default=0)
    urgency = models.CharField(max_length=10, choices=Urgency.choices, default=Urgency.URGENT)
    needed_by = models.DateTimeField()
    reason = models.CharField(max_length=200, blank=True)
    contact_name = models.CharField(max_length=120)
    contact_phone = models.CharField(max_length=20)
    notes = models.TextField(blank=True)

    location = models.PointField(geography=True, srid=4326)
    status = models.CharField(max_length=24, choices=Status.choices, default=Status.PENDING, db_index=True)
    verified_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="+")
    verified_at = models.DateTimeField(null=True, blank=True)
    current_wave = models.PositiveSmallIntegerField(default=0)
    search_radius_km = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["status", "urgency"])]

    def __str__(self):
        return f"{self.code} · {self.units_needed}u {self.blood_group} @ {self.hospital}"

    @property
    def units_pledged(self) -> int:
        return self.matches.filter(status__in=DonorMatch.ACTIVE_PLEDGES).count()

    @property
    def is_active(self) -> bool:
        return self.status == self.Status.OPEN


class DonorMatch(models.Model):
    class Status(models.TextChoices):
        NOTIFIED = "NOTIFIED", "Notified"
        ACCEPTED = "ACCEPTED", "On the way"
        ARRIVED = "ARRIVED", "Arrived at hospital"
        DONATED = "DONATED", "Donated"
        DECLINED = "DECLINED", "Declined"
        NO_SHOW = "NO_SHOW", "Did not arrive"
        STOOD_DOWN = "STOOD_DOWN", "No longer needed"

    ACTIVE_PLEDGES = [Status.ACCEPTED, Status.ARRIVED, Status.DONATED]

    request = models.ForeignKey(BloodRequest, on_delete=models.CASCADE, related_name="matches")
    donor = models.ForeignKey("donors.DonorProfile", on_delete=models.CASCADE, related_name="matches")
    wave = models.PositiveSmallIntegerField()
    distance_km = models.FloatField()
    score = models.FloatField()
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.NOTIFIED, db_index=True)
    eta_minutes = models.PositiveSmallIntegerField(null=True, blank=True)
    decline_reason = models.CharField(max_length=120, blank=True)
    notified_at = models.DateTimeField(auto_now_add=True)
    responded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-score"]
        constraints = [models.UniqueConstraint(fields=["request", "donor"], name="one_match_per_donor_per_request")]


class RequestEvent(models.Model):
    """Append-only timeline shown on the live tracker."""

    request = models.ForeignKey(BloodRequest, on_delete=models.CASCADE, related_name="events")
    kind = models.CharField(max_length=32)
    message = models.CharField(max_length=300)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

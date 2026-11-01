from datetime import date, timedelta

from django.conf import settings
from django.contrib.gis.db import models
from django.utils import timezone

from apps.core.blood import BloodGroup


class DonorProfile(models.Model):
    class Gender(models.TextChoices):
        MALE = "M", "Male"
        FEMALE = "F", "Female"
        OTHER = "O", "Other"

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="donor_profile")
    blood_group = models.CharField(max_length=3, choices=BloodGroup.choices, db_index=True)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=1, choices=Gender.choices, blank=True)
    weight_kg = models.PositiveSmallIntegerField(null=True, blank=True)
    location = models.PointField(geography=True, srid=4326, null=True, blank=True)
    max_travel_km = models.PositiveSmallIntegerField(default=15)
    is_available = models.BooleanField(default=True, db_index=True)
    last_donation_date = models.DateField(null=True, blank=True)
    last_notified_at = models.DateTimeField(null=True, blank=True)
    notify_sms = models.BooleanField(default=True)
    notify_email = models.BooleanField(default=True)
    # Reliability signals for ranking
    alerts_received = models.PositiveIntegerField(default=0)
    alerts_accepted = models.PositiveIntegerField(default=0)
    donations_count = models.PositiveIntegerField(default=0)
    no_show_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.full_name} ({self.blood_group})"

    @property
    def next_eligible_date(self) -> date | None:
        if not self.last_donation_date:
            return None
        return self.last_donation_date + timedelta(days=settings.BLOODLINK["DONATION_COOLDOWN_DAYS"])

    @property
    def is_eligible(self) -> bool:
        ned = self.next_eligible_date
        if ned and ned > timezone.localdate():
            return False
        if self.weight_kg and self.weight_kg < 45:
            return False
        if self.date_of_birth:
            age = (timezone.localdate() - self.date_of_birth).days // 365
            if age < 18 or age > 65:
                return False
        return True

    @property
    def reliability(self) -> float:
        """0..1 — Laplace-smoothed acceptance rate, penalised for no-shows."""
        rate = (self.alerts_accepted + 1) / (self.alerts_received + 2)
        return max(0.0, rate - 0.15 * self.no_show_count)


class Donation(models.Model):
    donor = models.ForeignKey(DonorProfile, on_delete=models.CASCADE, related_name="donations")
    request = models.ForeignKey("bloodrequests.BloodRequest", null=True, blank=True, on_delete=models.SET_NULL)
    hospital = models.ForeignKey("hospitals.Hospital", null=True, blank=True, on_delete=models.SET_NULL)
    donated_on = models.DateField(default=timezone.localdate)
    units = models.PositiveSmallIntegerField(default=1)
    confirmed_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-donated_on"]

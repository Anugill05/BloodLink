from django.conf import settings
from django.db import models


class Notification(models.Model):
    class Kind(models.TextChoices):
        DONOR_ALERT = "DONOR_ALERT", "Someone near you needs blood"
        DONOR_STOOD_DOWN = "DONOR_STOOD_DOWN", "Request covered"
        DONOR_THANKS = "DONOR_THANKS", "Donation confirmed"
        DONOR_ELIGIBLE = "DONOR_ELIGIBLE", "Eligible again"
        REQUEST_UPDATE = "REQUEST_UPDATE", "Request update"
        HOSPITAL_VERIFY = "HOSPITAL_VERIFY", "Request needs verification"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    kind = models.CharField(max_length=20, choices=Kind.choices)
    title = models.CharField(max_length=140)
    body = models.CharField(max_length=500)
    link = models.CharField(max_length=300, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)
    sent_sms = models.BooleanField(default=False)
    sent_email = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

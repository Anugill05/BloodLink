from datetime import timedelta

from celery import shared_task
from django.conf import settings
from django.utils import timezone

from apps.notifications.models import Notification
from apps.notifications.tasks import notify

from .models import DonorProfile


@shared_task
def send_eligibility_reminders():
    """Tell donors the day they become eligible again — the cheapest way to grow the active pool."""
    became_eligible_on = timezone.localdate() - timedelta(days=settings.BLOODLINK["DONATION_COOLDOWN_DAYS"])
    donors = DonorProfile.objects.filter(last_donation_date=became_eligible_on).select_related("user")
    for d in donors:
        notify(d.user, Notification.Kind.DONOR_ELIGIBLE, "You can donate again 💪",
               "It's been 90 days since your last donation. Turn on availability to get alerts.", link="/donor", sms=False)
    return donors.count()

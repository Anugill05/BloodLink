from celery import shared_task
from django.conf import settings
from django.db import transaction

from .channels import send_email, sms_backend
from .models import Notification


@shared_task(autoretry_for=(Exception,), retry_backoff=True, max_retries=3)
def deliver_notification(notification_id: int, sms: bool = True, email: bool = True):
    n = Notification.objects.select_related("user").get(pk=notification_id)
    user = n.user
    link = f"{settings.FRONTEND_URL}{n.link}" if n.link else settings.FRONTEND_URL
    profile = getattr(user, "donor_profile", None)
    if sms and user.phone and (profile is None or profile.notify_sms):
        n.sent_sms = sms_backend().send(user.phone, f"BloodLink: {n.title}. {n.body} {link}"[:320])
    if email and user.email and (profile is None or profile.notify_email):
        n.sent_email = send_email(user.email, n.title, f"{n.body}\n\nOpen: {link}\n\n— BloodLink")
    n.save(update_fields=["sent_sms", "sent_email"])


def notify(user, kind, title, body, link="", sms=True, email=True) -> Notification:
    n = Notification.objects.create(user=user, kind=kind, title=title, body=body, link=link)
    # Only hand off to the worker once the row is committed, or the worker may not see it.
    transaction.on_commit(lambda: deliver_notification.delay(n.id, sms=sms, email=email))
    return n

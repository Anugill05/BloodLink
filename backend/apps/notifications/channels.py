"""Delivery channels. SMS is pluggable: `console` for dev, `twilio` for production.
(MSG91 / Gupshup can be added the same way — implement send() and register it below.)"""
import base64
import json
import logging
import urllib.parse
import urllib.request

from django.conf import settings
from django.core.mail import send_mail

log = logging.getLogger("bloodlink")


class ConsoleSMS:
    def send(self, to: str, body: str) -> bool:
        log.info("[SMS → %s] %s", to, body)
        return True


class TwilioSMS:
    def send(self, to: str, body: str) -> bool:
        sid, token = settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN
        url = f"https://api.twilio.com/2010-04-01/Accounts/{sid}/Messages.json"
        data = urllib.parse.urlencode({"To": to, "From": settings.TWILIO_FROM_NUMBER, "Body": body}).encode()
        req = urllib.request.Request(url, data=data)
        req.add_header("Authorization", "Basic " + base64.b64encode(f"{sid}:{token}".encode()).decode())
        try:
            with urllib.request.urlopen(req, timeout=10) as r:
                return 200 <= r.status < 300
        except Exception as exc:  # noqa: BLE001 — never let SMS failure break matching
            log.warning("twilio send failed: %s", exc)
            return False


SMS_BACKENDS = {"console": ConsoleSMS, "twilio": TwilioSMS}


def sms_backend():
    return SMS_BACKENDS.get(settings.SMS_BACKEND, ConsoleSMS)()


def send_email(to: str, subject: str, body: str) -> bool:
    try:
        return send_mail(subject, body, settings.DEFAULT_FROM_EMAIL, [to], fail_silently=False) > 0
    except Exception as exc:  # noqa: BLE001
        log.warning("email send failed: %s", exc)
        return False

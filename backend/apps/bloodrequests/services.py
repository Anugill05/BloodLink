"""Request lifecycle. Views stay thin; every state change goes through here so the timeline,
notifications and counters can never drift apart."""
from django.db import transaction
from django.db.models import F
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied, ValidationError

from apps.donors.models import Donation, DonorProfile
from apps.notifications.models import Notification
from apps.notifications.tasks import notify

from .models import BloodRequest, DonorMatch, RequestEvent

S = BloodRequest.Status
M = DonorMatch.Status


def log_event(req, kind, message):
    RequestEvent.objects.create(request=req, kind=kind, message=message)


def _start_matching(req):
    from .tasks import run_matching_wave

    transaction.on_commit(lambda: run_matching_wave.delay(str(req.pk)))


@transaction.atomic
def create_request(user, data) -> BloodRequest:
    hospital = data["hospital"]
    if not hospital.is_verified:
        raise ValidationError({"hospital": "This hospital is not verified on BloodLink yet."})
    req = BloodRequest.objects.create(created_by=user, location=hospital.location, **data)
    log_event(req, "CREATED", f"Request for {req.units_needed} unit(s) of {req.blood_group} created")
    if user.hospital_id == hospital.id:
        # Raised by the hospital itself — already verified.
        verify_request(req, user)
    else:
        for staff in hospital.staff.filter(is_active=True):
            notify(
                staff,
                Notification.Kind.HOSPITAL_VERIFY,
                f"Verify {req.code}: {req.units_needed}u {req.blood_group}",
                f"{req.patient_name} — please confirm this patient is admitted before donors are alerted.",
                link="/hospital",
                sms=req.urgency == BloodRequest.Urgency.CRITICAL,
            )
        log_event(req, "PENDING", f"Waiting for {hospital.name} to confirm the patient is admitted")
    return req


def _assert_staff(req, user):
    if not (user.hospital_id and user.hospital_id == req.hospital_id) and not user.is_superuser:
        raise PermissionDenied("Only staff at the treating hospital can do this.")


@transaction.atomic
def verify_request(req, user):
    _assert_staff(req, user)
    if req.status != S.PENDING:
        raise ValidationError("Only pending requests can be verified.")
    req.status, req.verified_by, req.verified_at = S.OPEN, user, timezone.now()
    req.save(update_fields=["status", "verified_by", "verified_at", "updated_at"])
    log_event(req, "VERIFIED", f"Verified by {req.hospital.name}. Searching for donors…")
    if req.created_by and req.created_by != user:
        notify(req.created_by, Notification.Kind.REQUEST_UPDATE, f"{req.code} verified",
               "The hospital confirmed your request. We are alerting nearby donors now.", link=f"/requests/{req.pk}")
    _start_matching(req)
    return req


@transaction.atomic
def reject_request(req, user, reason=""):
    _assert_staff(req, user)
    if req.status != S.PENDING:
        raise ValidationError("Only pending requests can be rejected.")
    req.status = S.REJECTED
    req.save(update_fields=["status", "updated_at"])
    log_event(req, "REJECTED", f"Rejected by hospital{': ' + reason if reason else ''}")
    if req.created_by:
        notify(req.created_by, Notification.Kind.REQUEST_UPDATE, f"{req.code} could not be verified",
               reason or "The hospital could not confirm this patient. Please contact the ward.", link=f"/requests/{req.pk}")
    return req


def _stand_down(req, message):
    for m in req.matches.filter(status__in=[M.NOTIFIED, M.ACCEPTED]).select_related("donor__user"):
        was_accepted = m.status == M.ACCEPTED
        m.status = M.STOOD_DOWN
        m.save(update_fields=["status"])
        if was_accepted:  # only bother people who were actually acting on it
            notify(m.donor.user, Notification.Kind.DONOR_STOOD_DOWN, "You can stand down", message, link="/donor")


@transaction.atomic
def cancel_request(req, user):
    if user != req.created_by:
        _assert_staff(req, user)
    if req.status not in (S.PENDING, S.OPEN):
        raise ValidationError("This request is already closed.")
    req.status = S.CANCELLED
    req.save(update_fields=["status", "updated_at"])
    log_event(req, "CANCELLED", "Request cancelled")
    _stand_down(req, f"{req.code} was cancelled by the hospital. Thank you for being ready to help.")
    return req


# --- Donor side -------------------------------------------------------------

def _own_match(match, user) -> DonorMatch:
    if match.donor.user_id != user.id:
        raise PermissionDenied()
    return match


@transaction.atomic
def accept_match(match, user, eta_minutes=None):
    _own_match(match, user)
    req = BloodRequest.objects.select_for_update().get(pk=match.request_id)
    if req.status != S.OPEN:
        raise ValidationError("This request is no longer open.")
    if match.status != M.NOTIFIED:
        raise ValidationError("You already responded to this request.")
    if req.units_pledged >= req.units_needed:
        match.status = M.STOOD_DOWN
        match.save(update_fields=["status"])
        raise ValidationError("Enough donors are already on the way. Thank you!")
    match.status, match.responded_at, match.eta_minutes = M.ACCEPTED, timezone.now(), eta_minutes
    match.save(update_fields=["status", "responded_at", "eta_minutes"])
    DonorProfile.objects.filter(pk=match.donor_id).update(alerts_accepted=F("alerts_accepted") + 1)
    eta = f", ETA {eta_minutes} min" if eta_minutes else ""
    log_event(req, "ACCEPTED", f"A {match.donor.blood_group} donor {match.distance_km:.1f} km away is on the way{eta}")
    if req.created_by:
        notify(req.created_by, Notification.Kind.REQUEST_UPDATE, f"A donor is on the way for {req.code}",
               f"{req.units_pledged}/{req.units_needed} units pledged.", link=f"/requests/{req.pk}", email=False)
    if req.units_pledged >= req.units_needed:
        # Covered: quietly close the remaining open alerts so nobody else travels for nothing.
        req.matches.filter(status=M.NOTIFIED).update(status=M.STOOD_DOWN)
        log_event(req, "COVERED", "All units pledged — remaining alerts withdrawn")
    return match


@transaction.atomic
def decline_match(match, user, reason=""):
    _own_match(match, user)
    if match.status not in (M.NOTIFIED, M.ACCEPTED):
        raise ValidationError("Nothing to decline.")
    was_accepted = match.status == M.ACCEPTED
    match.status, match.responded_at, match.decline_reason = M.DECLINED, timezone.now(), reason[:120]
    match.save(update_fields=["status", "responded_at", "decline_reason"])
    if was_accepted:
        log_event(match.request, "WITHDRAWN", "A donor had to withdraw — searching again")
        _start_matching(match.request)
    return match


@transaction.atomic
def mark_arrived(match, user):
    _assert_staff(match.request, user)
    if match.status != M.ACCEPTED:
        raise ValidationError("Donor has not accepted.")
    match.status = M.ARRIVED
    match.save(update_fields=["status"])
    log_event(match.request, "ARRIVED", f"{match.donor.blood_group} donor checked in at the blood bank")
    return match


@transaction.atomic
def confirm_donation(match, user, units=1):
    req = BloodRequest.objects.select_for_update().get(pk=match.request_id)
    _assert_staff(req, user)
    if match.status not in (M.ACCEPTED, M.ARRIVED):
        raise ValidationError("Donor must have accepted before donating.")
    match.status = M.DONATED
    match.save(update_fields=["status"])
    donor = match.donor
    Donation.objects.create(donor=donor, request=req, hospital=req.hospital, units=units, confirmed_by=user)
    DonorProfile.objects.filter(pk=donor.pk).update(
        last_donation_date=timezone.localdate(), donations_count=F("donations_count") + 1
    )
    req.units_fulfilled = F("units_fulfilled") + units
    req.save(update_fields=["units_fulfilled", "updated_at"])
    req.refresh_from_db()
    log_event(req, "DONATED", f"Donation collected ({req.units_fulfilled}/{req.units_needed} units)")
    notify(donor.user, Notification.Kind.DONOR_THANKS, "Thank you — your donation is confirmed",
           f"{req.hospital.name} confirmed your donation. You'll be eligible again in 90 days.", link="/donor")
    if req.units_fulfilled >= req.units_needed:
        req.status = S.FULFILLED
        req.save(update_fields=["status", "updated_at"])
        log_event(req, "FULFILLED", "Request fulfilled 🎉")
        _stand_down(req, f"{req.code} is fully covered. Thank you for responding!")
        if req.created_by:
            notify(req.created_by, Notification.Kind.REQUEST_UPDATE, f"{req.code} fulfilled",
                   "All units have been collected. Wishing the patient a quick recovery.", link=f"/requests/{req.pk}")
    return match


@transaction.atomic
def mark_no_show(match, user):
    _assert_staff(match.request, user)
    if match.status != M.ACCEPTED:
        raise ValidationError("Only accepted donors can be marked as no-show.")
    match.status = M.NO_SHOW
    match.save(update_fields=["status"])
    DonorProfile.objects.filter(pk=match.donor_id).update(no_show_count=F("no_show_count") + 1)
    log_event(match.request, "NO_SHOW", "A pledged donor did not arrive — searching again")
    _start_matching(match.request)
    return match

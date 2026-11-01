from datetime import timedelta

import pytest
from django.test import override_settings
from django.utils import timezone
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.bloodrequests import services
from apps.bloodrequests.matching import find_candidates, run_wave
from apps.bloodrequests.models import BloodRequest, DonorMatch
from apps.core.blood import can_donate, compatible_donor_groups
from apps.core.geo import make_point
from apps.donors.models import DonorProfile
from apps.hospitals.models import Hospital

pytestmark = pytest.mark.django_db
MEERUT = (28.9845, 77.7064)


# --- Compatibility (pure) -------------------------------------------------------

@pytest.mark.parametrize("donor,recipient,ok", [
    ("O-", "AB+", True), ("O-", "O-", True), ("O+", "O-", False), ("A+", "A-", False),
    ("A-", "AB+", True), ("B+", "A+", False), ("AB+", "AB+", True), ("AB+", "O+", False),
])
def test_red_cell_compatibility(donor, recipient, ok):
    assert can_donate(donor, recipient) is ok


def test_plasma_is_reversed():
    assert can_donate("AB-", "O+", "PLASMA")
    assert not can_donate("O+", "AB+", "PLASMA")


def test_exact_match_ranked_first_and_universal_last():
    order = compatible_donor_groups("A+")
    assert order[0] == "A+"
    assert order[-1] == "O-"
    assert set(order) == {"A+", "A-", "O+", "O-"}


# --- Fixtures -----------------------------------------------------------------

def _hospital():
    return Hospital.objects.create(name="LLRM", registration_number="R1", address="Garh Rd", city="Meerut",
                                   phone="1", location=make_point(*MEERUT), is_verified=True)


def _donor(email, group, dlat=0.0, **kw):
    u = User.objects.create_user(email=email, password="x" * 10, full_name=f"{email} Kumar", phone="+919999", role="DONOR")
    return DonorProfile.objects.create(user=u, blood_group=group, location=make_point(MEERUT[0] + dlat, MEERUT[1]), **kw)


@pytest.fixture
def world():
    h = _hospital()
    staff = User.objects.create_user(email="staff@x.in", password="x" * 10, full_name="Dr Staff", role="HOSPITAL", hospital=h)
    family = User.objects.create_user(email="fam@x.in", password="x" * 10, full_name="Fam", role="REQUESTER")
    return h, staff, family


def _request(h, family, group="B+", units=1, urgency="URGENT"):
    return services.create_request(family, dict(
        hospital=h, patient_name="Patient X", blood_group=group, units_needed=units, urgency=urgency,
        needed_by=timezone.now() + timedelta(hours=6), contact_name="Fam", contact_phone="+91 1",
    ))


# --- Matching ---------------------------------------------------------------------

def test_candidates_filter_group_distance_cooldown(world):
    h, staff, family = world
    near_exact = _donor("a@x", "B+", 0.01)
    near_o = _donor("b@x", "O+", 0.01)
    _donor("c@x", "A+", 0.01)                                     # incompatible
    _donor("d@x", "B+", 0.5)                                      # ~55 km away
    _donor("e@x", "B+", 0.01, last_donation_date=timezone.localdate() - timedelta(days=30))  # cooling down
    _donor("f@x", "B+", 0.01, is_available=False)
    req = _request(h, family)
    req.status = BloodRequest.Status.OPEN
    req.save()
    got = find_candidates(req, 10)
    assert [c.donor for c in got] == [near_exact, near_o]  # exact match outranks O+


@override_settings(CELERY_TASK_ALWAYS_EAGER=True)
def test_wave_expands_radius(world):
    h, staff, family = world
    req = _request(h, family)
    req.status = BloodRequest.Status.OPEN
    req.save()
    _donor("far@x", "B+", 0.09)  # ~10 km
    assert run_wave(req) == []
    req.refresh_from_db()
    assert req.search_radius_km == 5
    second = run_wave(req)
    assert len(second) == 1 and second[0].wave == 2


# --- Full lifecycle --------------------------------------------------------------

@pytest.fixture
def eager(settings):
    settings.CELERY_TASK_ALWAYS_EAGER = True


def test_end_to_end_lifecycle(world, eager, django_capture_on_commit_callbacks):
    h, staff, family = world
    d1, d2 = _donor("d1@x", "B+", 0.01), _donor("d2@x", "B+", 0.02)
    with django_capture_on_commit_callbacks(execute=True):
        req = _request(h, family)
    assert req.status == BloodRequest.Status.PENDING
    assert not req.matches.exists(), "donors must never be alerted before hospital verification"

    with django_capture_on_commit_callbacks(execute=True):
        services.verify_request(req, staff)
    assert req.matches.count() == 2

    m1 = req.matches.get(donor=d1)
    m2 = req.matches.get(donor=d2)
    with django_capture_on_commit_callbacks(execute=True):
        services.accept_match(m1, d1.user, eta_minutes=15)
    m2.refresh_from_db()
    assert m2.status == DonorMatch.Status.STOOD_DOWN, "extra alerts are withdrawn once covered"

    with django_capture_on_commit_callbacks(execute=True):
        services.confirm_donation(m1, staff)
    req.refresh_from_db()
    d1.refresh_from_db()
    assert req.status == BloodRequest.Status.FULFILLED
    assert d1.last_donation_date == timezone.localdate()
    assert not d1.is_eligible
    assert d1.user.notifications.filter(kind="DONOR_THANKS").exists()


def test_privacy_contact_hidden_until_accept(world, eager, django_capture_on_commit_callbacks):
    h, staff, family = world
    d = _donor("p@x", "B+", 0.01)
    with django_capture_on_commit_callbacks(execute=True):
        req = _request(h, family)
        services.verify_request(req, staff)
    api = APIClient()
    api.force_authenticate(d.user)
    alert = api.get("/api/donors/me/alerts/").json()[0]
    assert "contact_phone" not in alert["request"] and "patient_name" not in alert["request"]
    with django_capture_on_commit_callbacks(execute=True):
        res = api.post(f"/api/matches/{alert['id']}/accept/", {"eta_minutes": 20})
    assert res.status_code == 200
    assert res.json()["request"]["contact_phone"] == "+91 1"


# --- API ------------------------------------------------------------------------

def test_register_donor_and_public_endpoints(world):
    api = APIClient()
    r = api.post("/api/auth/register/", {
        "email": "new@x.in", "password": "longpassword1", "full_name": "New Donor", "phone": "+91 9",
        "role": "DONOR", "blood_group": "O-", "lat": MEERUT[0], "lng": MEERUT[1],
    }, format="json")
    assert r.status_code == 201, r.content
    assert r.json()["user"]["donor_profile"]["blood_group"] == "O-"
    assert api.get("/api/public/stats/").json()["donors"] == 1
    c = api.get("/api/public/compatibility/?group=AB%2B").json()
    assert c["receive_from"][0] == "AB+" and len(c["receive_from"]) == 8
    assert api.get(f"/api/hospitals/?lat={MEERUT[0]}&lng={MEERUT[1]}").json()["results"][0]["distance_km"] == 0.0


def test_only_hospital_staff_can_verify(world):
    h, staff, family = world
    req = _request(h, family)
    api = APIClient()
    api.force_authenticate(family)
    assert api.post(f"/api/requests/{req.id}/verify/").status_code == 403
    api.force_authenticate(staff)
    assert api.post(f"/api/requests/{req.id}/verify/").status_code == 200

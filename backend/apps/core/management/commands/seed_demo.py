"""Seed a realistic demo: verified hospitals in Meerut & Delhi NCR, ~300 donors around them,
and a few live requests. Safe to run twice (it wipes demo data first).

    python manage.py seed_demo
"""
import random
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from apps.accounts.models import User
from unittest import mock

from apps.bloodrequests import services
from apps.bloodrequests.matching import run_wave
from apps.bloodrequests.models import BloodRequest
from apps.core.geo import make_point
from apps.donors.models import DonorProfile
from apps.hospitals.models import Hospital

HOSPITALS = [
    ("LLRM Medical College Hospital", "Garh Road", "Meerut", 28.9845, 77.7350, True),
    ("Anand Hospital", "Delhi Road", "Meerut", 28.9631, 77.6862, True),
    ("Subharti Medical College", "NH-58, Subhartipuram", "Meerut", 29.0397, 77.7096, True),
    ("AIIMS New Delhi", "Ansari Nagar", "New Delhi", 28.5672, 77.2100, True),
    ("Safdarjung Hospital", "Ring Road", "New Delhi", 28.5685, 77.2066, True),
    ("Yashoda Super Speciality", "Kaushambi", "Ghaziabad", 28.6448, 77.3247, True),
]
FIRST = "Aarav Vivaan Aditya Ishaan Kabir Arjun Rohan Rahul Ananya Diya Saanvi Aadhya Kavya Priya Neha Pooja Sneha Riya Aman Vikas Sahil Mohit Nikhil Tanvi Meera Ishita Karan Varun Simran".split()
LAST = "Sharma Verma Tyagi Tomar Chauhan Gupta Agarwal Jain Singh Rana Malik Saini Kumar Yadav Bansal Mittal Goel".split()
# Approximate Indian blood-group distribution
GROUP_WEIGHTS = {"O+": 32, "B+": 32, "A+": 22, "AB+": 8, "O-": 2, "B-": 2, "A-": 1.5, "AB-": 0.5}


class Command(BaseCommand):
    help = "Seed demo data"

    @transaction.atomic
    def handle(self, *args, **opts):
        rng = random.Random(7)
        User.objects.filter(email__endswith="@demo.bloodlink").delete()
        BloodRequest.objects.filter(hospital__registration_number__startswith="DEMO-").delete()
        Hospital.objects.filter(registration_number__startswith="DEMO-").delete()

        hospitals = []
        for i, (name, addr, city, lat, lng, bank) in enumerate(HOSPITALS):
            h = Hospital.objects.create(
                name=name, address=addr, city=city, phone=f"+91 98100 0{i:04d}", registration_number=f"DEMO-{i}",
                location=make_point(lat, lng), has_blood_bank=bank, is_verified=True,
            )
            hospitals.append(h)
            User.objects.create_user(
                email=f"staff{i}@demo.bloodlink", password="bloodlink123", full_name=f"Dr. {rng.choice(FIRST)} {rng.choice(LAST)}",
                role=User.Role.HOSPITAL, hospital=h, phone=f"+91 98110 0{i:04d}", city=city,
            )

        groups, weights = zip(*GROUP_WEIGHTS.items())
        for n in range(320):
            h = rng.choice(hospitals)
            lat = h.location.y + rng.gauss(0, 0.08)
            lng = h.location.x + rng.gauss(0, 0.08)
            u = User.objects.create_user(
                email=f"donor{n}@demo.bloodlink", password="bloodlink123",
                full_name=f"{rng.choice(FIRST)} {rng.choice(LAST)}", phone=f"+91 9{rng.randint(100000000, 999999999)}",
                city=h.city, role=User.Role.DONOR,
            )
            last = None if rng.random() < 0.5 else timezone.localdate() - timedelta(days=rng.randint(10, 400))
            accepted = rng.randint(0, 6)
            DonorProfile.objects.create(
                user=u, blood_group=rng.choices(groups, weights)[0], location=make_point(lat, lng),
                is_available=rng.random() < 0.85, last_donation_date=last, weight_kg=rng.randint(50, 95),
                gender=rng.choice("MF"), max_travel_km=rng.choice([10, 15, 20, 30]),
                alerts_received=accepted + rng.randint(0, 4), alerts_accepted=accepted, donations_count=rng.randint(0, 9),
            )

        # Demo personas
        family = User.objects.create_user(
            email="family@demo.bloodlink", password="bloodlink123", full_name="Rakesh Tomar",
            phone="+91 98970 12345", city="Meerut", role=User.Role.REQUESTER,
        )
        me = User.objects.create_user(
            email="donor@demo.bloodlink", password="bloodlink123", full_name="Satyam Tomar",
            phone="+91 98970 54321", city="Meerut", role=User.Role.DONOR,
        )
        DonorProfile.objects.create(user=me, blood_group="O+", location=make_point(28.98, 77.71), max_travel_km=20,
                                    donations_count=4, alerts_received=6, alerts_accepted=5,
                                    last_donation_date=timezone.localdate() - timedelta(days=120))

        now = timezone.now()
        specs = [
            (hospitals[0], "B+", 2, "CRITICAL", "Road accident — trauma surgery", 4),
            (hospitals[1], "O+", 3, "URGENT", "Dengue — platelet support", 20),
            (hospitals[3], "A-", 1, "URGENT", "C-section, post-partum haemorrhage", 12),
            (hospitals[2], "AB+", 2, "PLANNED", "Scheduled cardiac bypass", 72),
        ]
        for h, g, units, urg, reason, hours in specs:
            staff = h.staff.first()
            req = services.create_request(family, dict(
                hospital=h, patient_name=f"{rng.choice(FIRST)} {rng.choice(LAST)}", patient_age=rng.randint(8, 70),
                blood_group=g, component="PLATELETS" if "platelet" in reason else "WHOLE_BLOOD", units_needed=units,
                urgency=urg, needed_by=now + timedelta(hours=hours), reason=reason,
                contact_name="Rakesh Tomar", contact_phone="+91 98970 12345",
            ))
            if g != "AB+":  # leave one pending so the hospital console has something to verify
                # Run exactly one wave inline so the demo is deterministic (no worker needed).
                with mock.patch.object(services, "_start_matching", lambda r: None):
                    services.verify_request(req, staff)
                run_wave(req)
                # Give live requests some motion: a few donors have already said yes.
                for m in req.matches.filter(status="NOTIFIED").order_by("-score")[: max(1, units - 1)]:
                    services.accept_match(m, m.donor.user, eta_minutes=rng.choice([10, 15, 25]))

        self.stdout.write(self.style.SUCCESS(
            "Seeded. Logins (password bloodlink123): donor@demo.bloodlink · family@demo.bloodlink · staff0@demo.bloodlink"
        ))

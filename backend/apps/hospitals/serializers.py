from django.db import transaction
from rest_framework import serializers

from apps.accounts.models import User
from apps.core.geo import LatLngMixin, make_point

from .models import Hospital


class HospitalSerializer(LatLngMixin, serializers.ModelSerializer):
    distance_km = serializers.SerializerMethodField()

    class Meta:
        model = Hospital
        fields = ["id", "name", "address", "city", "phone", "has_blood_bank", "is_verified", "coordinates", "distance_km"]

    def get_distance_km(self, obj):
        d = getattr(obj, "distance", None)
        return round(d.km, 1) if d is not None else None


class HospitalOnboardSerializer(serializers.Serializer):
    """A hospital signs up with one staff admin. It stays unverified until a BloodLink admin checks it."""

    name = serializers.CharField(max_length=200)
    registration_number = serializers.CharField(max_length=60)
    address = serializers.CharField(max_length=300)
    city = serializers.CharField(max_length=80)
    phone = serializers.CharField(max_length=20)
    lat = serializers.FloatField()
    lng = serializers.FloatField()
    has_blood_bank = serializers.BooleanField(default=False)
    staff_name = serializers.CharField(max_length=120)
    staff_email = serializers.EmailField()
    staff_password = serializers.CharField(write_only=True, min_length=8)

    def validate_registration_number(self, v):
        if Hospital.objects.filter(registration_number__iexact=v).exists():
            raise serializers.ValidationError("This hospital is already registered.")
        return v

    def validate_staff_email(self, v):
        if User.objects.filter(email__iexact=v).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return v.lower()

    @transaction.atomic
    def create(self, d):
        h = Hospital.objects.create(
            name=d["name"], registration_number=d["registration_number"], address=d["address"], city=d["city"],
            phone=d["phone"], has_blood_bank=d["has_blood_bank"], location=make_point(d["lat"], d["lng"]),
        )
        user = User.objects.create_user(
            email=d["staff_email"], password=d["staff_password"], full_name=d["staff_name"],
            phone=d["phone"], city=d["city"], role=User.Role.HOSPITAL, hospital=h,
        )
        return user

from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from apps.core.blood import BloodGroup
from apps.core.geo import make_point
from apps.donors.models import DonorProfile
from apps.donors.serializers import DonorProfileSerializer

from .models import User


def tokens_for(user):
    r = RefreshToken.for_user(user)
    return {"access": str(r.access_token), "refresh": str(r)}


class UserSerializer(serializers.ModelSerializer):
    hospital = serializers.SerializerMethodField()
    donor_profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "email", "full_name", "phone", "city", "role", "hospital", "donor_profile"]
        read_only_fields = ["id", "email", "role", "hospital"]

    def get_hospital(self, u):
        h = u.hospital
        return {"id": h.id, "name": h.name, "city": h.city, "is_verified": h.is_verified} if h else None

    def get_donor_profile(self, u):
        p = getattr(u, "donor_profile", None)
        return DonorProfileSerializer(p).data if p else None


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    full_name = serializers.CharField(max_length=120)
    phone = serializers.CharField(max_length=20)
    city = serializers.CharField(max_length=80, required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=[User.Role.DONOR, User.Role.REQUESTER], default=User.Role.DONOR)
    # Donor-only
    blood_group = serializers.ChoiceField(choices=BloodGroup.choices, required=False)
    lat = serializers.FloatField(required=False)
    lng = serializers.FloatField(required=False)
    date_of_birth = serializers.DateField(required=False)
    gender = serializers.ChoiceField(choices=DonorProfile.Gender.choices, required=False)
    weight_kg = serializers.IntegerField(required=False, min_value=30, max_value=250)
    last_donation_date = serializers.DateField(required=False, allow_null=True)

    def validate_email(self, v):
        if User.objects.filter(email__iexact=v).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return v.lower()

    def validate_password(self, v):
        validate_password(v)
        return v

    def validate(self, attrs):
        if attrs.get("role") == User.Role.DONOR:
            missing = [f for f in ("blood_group", "lat", "lng") if attrs.get(f) is None]
            if missing:
                raise serializers.ValidationError({f: "Required for donors." for f in missing})
        return attrs

    @transaction.atomic
    def create(self, data):
        donor_fields = {k: data.pop(k) for k in ("blood_group", "date_of_birth", "gender", "weight_kg", "last_donation_date") if k in data}
        lat, lng = data.pop("lat", None), data.pop("lng", None)
        user = User.objects.create_user(**data)
        if user.role == User.Role.DONOR:
            DonorProfile.objects.create(user=user, location=make_point(lat, lng), **donor_fields)
        return user

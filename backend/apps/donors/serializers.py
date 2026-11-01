from rest_framework import serializers

from apps.core.geo import LatLngMixin

from .models import Donation, DonorProfile


class DonorProfileSerializer(LatLngMixin, serializers.ModelSerializer):
    next_eligible_date = serializers.DateField(read_only=True)
    is_eligible = serializers.BooleanField(read_only=True)
    reliability = serializers.FloatField(read_only=True)
    lives_impacted = serializers.SerializerMethodField()

    class Meta:
        model = DonorProfile
        fields = [
            "blood_group", "date_of_birth", "gender", "weight_kg", "max_travel_km", "is_available",
            "last_donation_date", "notify_sms", "notify_email", "donations_count", "alerts_received",
            "alerts_accepted", "next_eligible_date", "is_eligible", "reliability", "lives_impacted",
            "lat", "lng", "coordinates",
        ]
        read_only_fields = ["donations_count", "alerts_received", "alerts_accepted"]

    def get_lives_impacted(self, obj):
        # One whole-blood unit is separated into up to 3 components (red cells, plasma, platelets).
        return obj.donations_count * 3

    def update(self, instance, validated_data):
        return super().update(instance, self.pop_location(validated_data))


class DonationSerializer(serializers.ModelSerializer):
    hospital_name = serializers.CharField(source="hospital.name", default=None)
    request_code = serializers.CharField(source="request.code", default=None)

    class Meta:
        model = Donation
        fields = ["id", "donated_on", "units", "hospital_name", "request_code"]

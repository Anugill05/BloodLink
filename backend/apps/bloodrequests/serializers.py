from datetime import timedelta

from django.utils import timezone
from rest_framework import serializers

from apps.core.geo import LatLngMixin
from apps.hospitals.models import Hospital

from .models import BloodRequest, DonorMatch, RequestEvent


class HospitalMiniSerializer(LatLngMixin, serializers.ModelSerializer):
    class Meta:
        model = Hospital
        fields = ["id", "name", "address", "city", "phone", "coordinates"]


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = RequestEvent
        fields = ["kind", "message", "created_at"]


class BloodRequestCreateSerializer(serializers.ModelSerializer):
    hospital = serializers.PrimaryKeyRelatedField(queryset=Hospital.objects.all())

    class Meta:
        model = BloodRequest
        fields = [
            "hospital", "patient_name", "patient_age", "blood_group", "component", "units_needed",
            "urgency", "needed_by", "reason", "contact_name", "contact_phone", "notes",
        ]

    def validate_units_needed(self, v):
        if not 1 <= v <= 10:
            raise serializers.ValidationError("Between 1 and 10 units per request.")
        return v

    def validate_needed_by(self, v):
        if v < timezone.now() - timedelta(minutes=5):
            raise serializers.ValidationError("Must be in the future.")
        return v


class RequestMatchSerializer(serializers.ModelSerializer):
    """How a donor appears to the family / hospital. Identity is revealed only after they accept,
    and the phone number only to hospital staff."""

    blood_group = serializers.CharField(source="donor.blood_group")
    donor_name = serializers.SerializerMethodField()
    donor_phone = serializers.SerializerMethodField()

    class Meta:
        model = DonorMatch
        fields = ["id", "blood_group", "distance_km", "status", "wave", "eta_minutes", "notified_at", "responded_at", "donor_name", "donor_phone"]

    def _revealed(self, m):
        return m.status in DonorMatch.ACTIVE_PLEDGES

    def get_donor_name(self, m):
        if not self._revealed(m):
            return None
        name = m.donor.user.full_name
        return name if self.context.get("is_staff") else name.split(" ")[0]

    def get_donor_phone(self, m):
        return m.donor.user.phone if self._revealed(m) and self.context.get("is_staff") else None


class BloodRequestSerializer(serializers.ModelSerializer):
    hospital = HospitalMiniSerializer()
    units_pledged = serializers.IntegerField(read_only=True)
    stats = serializers.SerializerMethodField()
    matches = serializers.SerializerMethodField()
    events = EventSerializer(many=True, read_only=True)
    status_label = serializers.CharField(source="get_status_display")
    component_label = serializers.CharField(source="get_component_display")

    class Meta:
        model = BloodRequest
        fields = [
            "id", "code", "hospital", "patient_name", "patient_age", "blood_group", "component", "component_label",
            "units_needed", "units_fulfilled", "units_pledged", "urgency", "needed_by", "reason", "contact_name",
            "contact_phone", "notes", "status", "status_label", "current_wave", "search_radius_km", "verified_at",
            "created_at", "stats", "matches", "events",
        ]

    def get_stats(self, r):
        counts = {s: 0 for s in DonorMatch.Status.values}
        for m in r.matches.all():
            counts[m.status] += 1
        counts["total"] = sum(counts.values())
        return counts

    def get_matches(self, r):
        ms = r.matches.select_related("donor__user").order_by("-score")
        return RequestMatchSerializer(ms, many=True, context=self.context).data


class BloodRequestListSerializer(serializers.ModelSerializer):
    hospital_name = serializers.CharField(source="hospital.name")
    units_pledged = serializers.IntegerField(read_only=True)

    class Meta:
        model = BloodRequest
        fields = [
            "id", "code", "hospital_name", "patient_name", "blood_group", "component", "units_needed",
            "units_fulfilled", "units_pledged", "urgency", "needed_by", "status", "current_wave",
            "search_radius_km", "created_at", "contact_name", "contact_phone",
        ]


class PublicRequestSerializer(serializers.ModelSerializer):
    """Shareable, anonymised view (no patient name, no phone numbers)."""

    hospital_name = serializers.CharField(source="hospital.name")
    city = serializers.CharField(source="hospital.city")
    units_pledged = serializers.IntegerField(read_only=True)
    component_label = serializers.CharField(source="get_component_display")

    class Meta:
        model = BloodRequest
        fields = [
            "code", "blood_group", "component", "component_label", "units_needed", "units_fulfilled", "units_pledged",
            "urgency", "needed_by", "hospital_name", "city", "status", "created_at",
        ]


class DonorAlertSerializer(serializers.ModelSerializer):
    """A request as seen by an alerted donor. Patient contact appears only after accepting."""

    request = serializers.SerializerMethodField()

    class Meta:
        model = DonorMatch
        fields = ["id", "status", "distance_km", "eta_minutes", "notified_at", "responded_at", "request"]

    def get_request(self, m):
        r = m.request
        data = {
            "code": r.code, "blood_group": r.blood_group, "component": r.component,
            "component_label": r.get_component_display(), "units_needed": r.units_needed,
            "units_pledged": r.units_pledged, "urgency": r.urgency, "needed_by": r.needed_by,
            "status": r.status, "reason": r.reason,
            "hospital": HospitalMiniSerializer(r.hospital).data,
        }
        if m.status in DonorMatch.ACTIVE_PLEDGES:
            data.update(patient_name=r.patient_name, contact_name=r.contact_name, contact_phone=r.contact_phone, notes=r.notes)
        return data

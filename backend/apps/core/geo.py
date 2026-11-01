from django.contrib.gis.geos import Point
from rest_framework import serializers


def make_point(lat, lng) -> Point:
    # PostGIS stores (x=longitude, y=latitude)
    return Point(float(lng), float(lat), srid=4326)


class LatLngMixin(serializers.Serializer):
    """Exposes a PointField `location` as plain lat/lng numbers on the API."""

    lat = serializers.FloatField(write_only=True, required=False, min_value=-90, max_value=90)
    lng = serializers.FloatField(write_only=True, required=False, min_value=-180, max_value=180)
    coordinates = serializers.SerializerMethodField()

    def get_coordinates(self, obj):
        loc = getattr(obj, "location", None)
        return {"lat": loc.y, "lng": loc.x} if loc else None

    def pop_location(self, validated_data):
        lat, lng = validated_data.pop("lat", None), validated_data.pop("lng", None)
        if lat is not None and lng is not None:
            validated_data["location"] = make_point(lat, lng)
        return validated_data

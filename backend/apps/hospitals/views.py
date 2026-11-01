from django.contrib.gis.db.models.functions import Distance
from django.db.models import Q
from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.accounts.serializers import UserSerializer, tokens_for
from apps.core.geo import make_point

from .models import Hospital
from .serializers import HospitalOnboardSerializer, HospitalSerializer


class HospitalList(generics.ListAPIView):
    """Verified hospitals, nearest first when ?lat=&lng= are given. ?q= searches name/city."""

    permission_classes = [AllowAny]
    serializer_class = HospitalSerializer

    def get_queryset(self):
        qs = Hospital.objects.filter(is_verified=True)
        q = self.request.query_params.get("q")
        if q:
            qs = qs.filter(Q(name__icontains=q) | Q(city__icontains=q) | Q(address__icontains=q))
        lat, lng = self.request.query_params.get("lat"), self.request.query_params.get("lng")
        if lat and lng:
            qs = qs.annotate(distance=Distance("location", make_point(lat, lng))).order_by("distance")
        return qs


class HospitalOnboard(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = HospitalOnboardSerializer

    def create(self, request, *args, **kwargs):
        s = self.get_serializer(data=request.data)
        s.is_valid(raise_exception=True)
        user = s.save()
        return Response({"user": UserSerializer(user).data, "tokens": tokens_for(user)}, status=status.HTTP_201_CREATED)

from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.bloodrequests.models import DonorMatch
from apps.bloodrequests.serializers import DonorAlertSerializer
from apps.core.permissions import IsDonor

from .serializers import DonationSerializer, DonorProfileSerializer


class MyDonorProfile(generics.RetrieveUpdateAPIView):
    permission_classes = [IsDonor]
    serializer_class = DonorProfileSerializer

    def get_object(self):
        return self.request.user.donor_profile


class MyAlerts(APIView):
    """Active alerts first (needs a response), then history."""

    permission_classes = [IsDonor]

    def get(self, request):
        qs = (
            DonorMatch.objects.filter(donor=request.user.donor_profile)
            .select_related("request__hospital")
            .order_by("-notified_at")[:50]
        )
        return Response(DonorAlertSerializer(qs, many=True).data)


class MyDonations(generics.ListAPIView):
    permission_classes = [IsDonor]
    serializer_class = DonationSerializer
    pagination_class = None

    def get_queryset(self):
        return self.request.user.donor_profile.donations.select_related("hospital", "request")

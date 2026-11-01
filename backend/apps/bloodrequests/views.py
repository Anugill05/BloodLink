from django.db.models import Count, Q, Sum
from django.shortcuts import get_object_or_404
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action, api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle

from apps.core.blood import ALL_GROUPS, Component, can_give_to, compatible_donor_groups
from apps.core.permissions import IsHospitalStaff
from apps.donors.models import Donation, DonorProfile
from apps.hospitals.models import Hospital

from . import services
from .models import BloodRequest, DonorMatch
from .serializers import (
    BloodRequestCreateSerializer,
    BloodRequestListSerializer,
    BloodRequestSerializer,
    DonorAlertSerializer,
    PublicRequestSerializer,
)


class BloodRequestViewSet(mixins.CreateModelMixin, mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    filterset_fields = ["status", "urgency", "blood_group"]

    def get_throttles(self):
        if self.action == "create":
            self.throttle_scope = "create_request"
            return [ScopedRateThrottle()]
        return super().get_throttles()

    def get_queryset(self):
        u = self.request.user
        qs = BloodRequest.objects.select_related("hospital").prefetch_related("matches", "events")
        if u.is_superuser:
            return qs
        scope = Q(created_by=u)
        if u.hospital_id:
            scope |= Q(hospital_id=u.hospital_id)
        return qs.filter(scope)

    def get_serializer_class(self):
        if self.action == "create":
            return BloodRequestCreateSerializer
        if self.action == "list":
            return BloodRequestListSerializer
        return BloodRequestSerializer

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["is_staff"] = bool(self.request.user.hospital_id) or self.request.user.is_superuser
        return ctx

    def create(self, request, *args, **kwargs):
        s = BloodRequestCreateSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        req = services.create_request(request.user, s.validated_data)
        return Response(BloodRequestSerializer(req, context=self.get_serializer_context()).data, status=status.HTTP_201_CREATED)

    def _respond(self, req):
        req.refresh_from_db()
        return Response(BloodRequestSerializer(req, context=self.get_serializer_context()).data)

    @action(detail=True, methods=["post"], permission_classes=[IsHospitalStaff])
    def verify(self, request, pk=None):
        return self._respond(services.verify_request(self.get_object(), request.user))

    @action(detail=True, methods=["post"], permission_classes=[IsHospitalStaff])
    def reject(self, request, pk=None):
        return self._respond(services.reject_request(self.get_object(), request.user, request.data.get("reason", "")))

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        return self._respond(services.cancel_request(self.get_object(), request.user))


class MatchViewSet(viewsets.GenericViewSet):
    """Actions on a single donor↔request match. Donors accept/decline, hospital staff check in."""

    queryset = DonorMatch.objects.select_related("request__hospital", "donor__user")
    serializer_class = DonorAlertSerializer

    def get_queryset(self):
        u = self.request.user
        return self.queryset.filter(Q(donor__user=u) | Q(request__hospital_id=u.hospital_id or -1))

    def _ok(self, m):
        m.refresh_from_db()
        return Response(DonorAlertSerializer(m).data)

    @action(detail=True, methods=["post"])
    def accept(self, request, pk=None):
        eta = request.data.get("eta_minutes")
        return self._ok(services.accept_match(self.get_object(), request.user, int(eta) if eta else None))

    @action(detail=True, methods=["post"])
    def decline(self, request, pk=None):
        return self._ok(services.decline_match(self.get_object(), request.user, request.data.get("reason", "")))

    @action(detail=True, methods=["post"], permission_classes=[IsHospitalStaff])
    def arrived(self, request, pk=None):
        return self._ok(services.mark_arrived(self.get_object(), request.user))

    @action(detail=True, methods=["post"], permission_classes=[IsHospitalStaff])
    def confirm(self, request, pk=None):
        return self._ok(services.confirm_donation(self.get_object(), request.user, int(request.data.get("units", 1))))

    @action(detail=True, methods=["post"], url_path="no-show", permission_classes=[IsHospitalStaff])
    def no_show(self, request, pk=None):
        return self._ok(services.mark_no_show(self.get_object(), request.user))


# --- Public, unauthenticated -------------------------------------------------

@api_view(["GET"])
@permission_classes([AllowAny])
def public_feed(request):
    qs = BloodRequest.objects.filter(status=BloodRequest.Status.OPEN).select_related("hospital")
    city = request.query_params.get("city")
    if city:
        qs = qs.filter(hospital__city__iexact=city)
    return Response(PublicRequestSerializer(qs[:30], many=True).data)


@api_view(["GET"])
@permission_classes([AllowAny])
def public_request(request, code):
    req = get_object_or_404(BloodRequest.objects.select_related("hospital"), code=code.upper())
    if req.status in (BloodRequest.Status.PENDING, BloodRequest.Status.REJECTED):
        return Response({"detail": "Not found."}, status=404)
    return Response(PublicRequestSerializer(req).data)


@api_view(["GET"])
@permission_classes([AllowAny])
def public_stats(request):
    by_group = dict(
        DonorProfile.objects.filter(is_available=True).values_list("blood_group").annotate(n=Count("id")).order_by()
    )
    return Response({
        "donors": DonorProfile.objects.count(),
        "available_donors": DonorProfile.objects.filter(is_available=True).count(),
        "verified_hospitals": Hospital.objects.filter(is_verified=True).count(),
        "open_requests": BloodRequest.objects.filter(status=BloodRequest.Status.OPEN).count(),
        "fulfilled_requests": BloodRequest.objects.filter(status=BloodRequest.Status.FULFILLED).count(),
        "units_donated": Donation.objects.aggregate(n=Sum("units"))["n"] or 0,
        "available_by_group": {g: by_group.get(g, 0) for g in ALL_GROUPS},
    })


@api_view(["GET"])
@permission_classes([AllowAny])
@throttle_classes([])
def compatibility(request):
    group = request.query_params.get("group", "O+").replace(" ", "+")
    component = request.query_params.get("component", Component.WHOLE_BLOOD)
    if group not in ALL_GROUPS or component not in Component.values:
        return Response({"detail": "Unknown group or component."}, status=400)
    return Response({
        "group": group,
        "component": component,
        "receive_from": compatible_donor_groups(group, component),
        "give_to": can_give_to(group, component),
    })

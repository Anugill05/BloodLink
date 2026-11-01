from rest_framework.permissions import BasePermission


class IsDonor(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user.is_authenticated and hasattr(request.user, "donor_profile"))


class IsHospitalStaff(BasePermission):
    message = "Only staff of a verified hospital can do this."

    def has_permission(self, request, view):
        u = request.user
        return bool(u.is_authenticated and u.hospital_id and u.hospital.is_verified)

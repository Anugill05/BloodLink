from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from apps.accounts.views import Me, Register
from apps.bloodrequests import views as req
from apps.donors.views import MyAlerts, MyDonations, MyDonorProfile
from apps.hospitals.views import HospitalList, HospitalOnboard
from apps.notifications.views import NotificationViewSet

router = DefaultRouter()
router.register("requests", req.BloodRequestViewSet, basename="request")
router.register("matches", req.MatchViewSet, basename="match")
router.register("notifications", NotificationViewSet, basename="notification")

api = [
    path("auth/register/", Register.as_view()),
    path("auth/token/", TokenObtainPairView.as_view()),
    path("auth/token/refresh/", TokenRefreshView.as_view()),
    path("auth/me/", Me.as_view()),
    path("donors/me/", MyDonorProfile.as_view()),
    path("donors/me/alerts/", MyAlerts.as_view()),
    path("donors/me/donations/", MyDonations.as_view()),
    path("hospitals/", HospitalList.as_view()),
    path("hospitals/onboard/", HospitalOnboard.as_view()),
    path("public/feed/", req.public_feed),
    path("public/stats/", req.public_stats),
    path("public/requests/<str:code>/", req.public_request),
    path("public/compatibility/", req.compatibility),
    path("schema/", SpectacularAPIView.as_view(), name="schema"),
    path("docs/", SpectacularSwaggerView.as_view(url_name="schema")),
    path("", include(router.urls)),
]

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(api)),
    path("healthz", lambda r: JsonResponse({"ok": True})),
]

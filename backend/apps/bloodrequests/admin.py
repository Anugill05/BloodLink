from django.contrib import admin
from django.contrib.gis.admin import GISModelAdmin

from .models import BloodRequest, DonorMatch, RequestEvent


class MatchInline(admin.TabularInline):
    model = DonorMatch
    extra = 0
    readonly_fields = ["donor", "wave", "distance_km", "score", "status", "notified_at"]


@admin.register(BloodRequest)
class BloodRequestAdmin(GISModelAdmin):
    list_display = ["code", "blood_group", "units_needed", "urgency", "status", "hospital", "created_at"]
    list_filter = ["status", "urgency", "blood_group"]
    search_fields = ["code", "patient_name"]
    inlines = [MatchInline]


admin.site.register(RequestEvent)

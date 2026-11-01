from django.contrib import admin
from django.contrib.gis.admin import GISModelAdmin

from .models import Hospital


@admin.register(Hospital)
class HospitalAdmin(GISModelAdmin):
    list_display = ["name", "city", "registration_number", "has_blood_bank", "is_verified", "created_at"]
    list_filter = ["is_verified", "city", "has_blood_bank"]
    search_fields = ["name", "registration_number", "city"]
    actions = ["verify"]

    @admin.action(description="Mark selected hospitals as verified")
    def verify(self, request, queryset):
        queryset.update(is_verified=True)

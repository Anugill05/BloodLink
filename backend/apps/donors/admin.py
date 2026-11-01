from django.contrib import admin
from django.contrib.gis.admin import GISModelAdmin

from .models import Donation, DonorProfile


@admin.register(DonorProfile)
class DonorAdmin(GISModelAdmin):
    list_display = ["user", "blood_group", "is_available", "last_donation_date", "donations_count"]
    list_filter = ["blood_group", "is_available"]
    search_fields = ["user__full_name", "user__email"]


admin.site.register(Donation)

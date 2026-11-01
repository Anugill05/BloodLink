from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as Base

from .models import User


@admin.register(User)
class UserAdmin(Base):
    ordering = ["email"]
    list_display = ["email", "full_name", "role", "hospital", "is_active"]
    list_filter = ["role", "is_active"]
    search_fields = ["email", "full_name", "phone"]
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Profile", {"fields": ("full_name", "phone", "city", "role", "hospital")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups")}),
    )
    add_fieldsets = ((None, {"classes": ("wide",), "fields": ("email", "full_name", "password1", "password2")}),)

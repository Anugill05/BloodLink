from django.contrib import admin

from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ["user", "kind", "title", "sent_sms", "sent_email", "read_at", "created_at"]
    list_filter = ["kind"]

from django.contrib import admin
from import_export import resources
from import_export.admin import ImportExportModelAdmin
from .models import Notification
from django.utils.html import format_html

# ----------------------------
# Resource for import-export
# ----------------------------
class NotificationResource(resources.ModelResource):
    class Meta:
        model = Notification
        fields = (
            "id",
            "user",
            "title",
            "message",
            "is_read",
            "created_at",
        )

# ----------------------------
# Notification admin with import-export and statistics
# ----------------------------
@admin.register(Notification)
class NotificationAdmin(ImportExportModelAdmin):
    resource_class = NotificationResource

    list_display = ("user", "title", "is_read", "created_at", "notification_stats")
    search_fields = ("user__username", "title", "message")
    list_filter = ("is_read", "created_at")

    # Add general statistics to changelist_view
    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}

        # General statistics
        total_notifications = Notification.objects.count()
        unread_notifications = Notification.objects.filter(is_read=False).count()
        total_users_with_notifications = Notification.objects.values('user').distinct().count()

        # Pass stats to extra_context
        extra_context["general_stats"] = {
            "total_notifications": total_notifications,
            "unread_notifications": unread_notifications,
            "total_users_with_notifications": total_users_with_notifications,
        }

        return super().changelist_view(request, extra_context=extra_context)

    # Custom method to show statistics in list_display
    def notification_stats(self, obj=None):
        """
        Display general statistics in admin changelist.
        Cached to avoid repeated queries.
        """
        if not hasattr(self, 'general_stats_cache'):
            self.general_stats_cache = {
                "total_notifications": Notification.objects.count(),
                "unread_notifications": Notification.objects.filter(is_read=False).count(),
                "total_users_with_notifications": Notification.objects.values('user').distinct().count(),
            }

        stats = self.general_stats_cache
        return format_html(
            "<b>Total:</b> {} | <b>Unread:</b> {} | <b>Users with notifications:</b> {}",
            stats["total_notifications"], stats["unread_notifications"], stats["total_users_with_notifications"]
        )

    notification_stats.short_description = "General Statistics"
    notification_stats.allow_tags = True  # optional for older Django versions

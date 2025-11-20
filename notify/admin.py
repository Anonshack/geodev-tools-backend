from django.contrib import admin
from import_export import resources
from import_export.admin import ImportExportModelAdmin
from django.utils.html import format_html
from .models import Notification
from accounts.models import User


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


@admin.register(Notification)
class NotificationAdmin(ImportExportModelAdmin):
    resource_class = NotificationResource

    list_display = ("get_user_email", "title", "is_read", "created_at", "notification_stats")
    search_fields = ("user__email", "title", "message")
    list_filter = ("is_read", "created_at")


    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}

        # General statistics
        total_notifications = Notification.objects.count()
        unread_notifications = Notification.objects.filter(is_read=False).count()
        total_users_with_notifications = Notification.objects.values('user').distinct().count()

        # Pass stats to template context
        extra_context["general_stats"] = {
            "total_notifications": total_notifications,
            "unread_notifications": unread_notifications,
            "total_users_with_notifications": total_users_with_notifications,
        }

        return super().changelist_view(request, extra_context=extra_context)


    def get_user_email(self, obj):
        return obj.user.email if obj.user else "-"
    get_user_email.short_description = "User Email"
    get_user_email.admin_order_field = "user"


    def notification_stats(self, obj):
        stats = {
            "total_notifications": Notification.objects.count(),
            "unread_notifications": Notification.objects.filter(is_read=False).count(),
            "total_users_with_notifications": Notification.objects.values('user').distinct().count(),
        }

        return format_html(
            "<b>Total:</b> {} | <b>Unread:</b> {} | <b>Users:</b> {}",
            stats["total_notifications"],
            stats["unread_notifications"],
            stats["total_users_with_notifications"]
        )

    notification_stats.short_description = "General Statistics"

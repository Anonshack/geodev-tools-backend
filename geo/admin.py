from django.contrib import admin
from import_export import resources
from import_export.admin import ImportExportModelAdmin
from .models import UserLocation
from django.utils.html import format_html

# ----------------------------
# Resource for UserLocation
# ----------------------------
class UserLocationResource(resources.ModelResource):
    class Meta:
        model = UserLocation
        fields = (
            "user",
            "ip",
            "country",
            "city",
            "region",
            "created_at",
        )

# ----------------------------
# UserLocation admin with import-export and statistics
# ----------------------------
@admin.register(UserLocation)
class UserLocationAdmin(ImportExportModelAdmin):
    resource_class = UserLocationResource

    list_display = ("user", "ip", "country", "city", "region", "created_at", "location_stats")
    search_fields = ("user__username", "country", "city", "ip")
    list_filter = ("country", "city", "region")

    # Add general statistics to changelist_view
    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}

        # General statistics for UserLocation
        total_locations = UserLocation.objects.count()
        total_users_with_location = UserLocation.objects.values('user').distinct().count()

        # Pass stats to extra_context for potential template use
        extra_context["general_stats"] = {
            "total_locations": total_locations,
            "total_users_with_location": total_users_with_location,
        }

        return super().changelist_view(request, extra_context=extra_context)

    # Custom method to show statistics in list_display
    def location_stats(self, obj=None):
        """
        Display general statistics in admin changelist.
        Cached to avoid repeated queries.
        """
        if not hasattr(self, 'general_stats_cache'):
            self.general_stats_cache = {
                "total_locations": UserLocation.objects.count(),
                "total_users_with_location": UserLocation.objects.values('user').distinct().count()
            }

        stats = self.general_stats_cache
        return format_html(
            "<b>Total locations:</b> {} | <b>Users with location:</b> {}",
            stats["total_locations"], stats["total_users_with_location"]
        )

    location_stats.short_description = "General Statistics"
    location_stats.allow_tags = True  # optional for older Django versions

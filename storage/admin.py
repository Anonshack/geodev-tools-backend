from django.contrib import admin
from import_export import resources
from import_export.admin import ImportExportModelAdmin
from django.utils.html import format_html
from django.db.models import Sum
from .models import StoredFile

# ----------------------------
# Resource for import-export
# ----------------------------
class StoredFileResource(resources.ModelResource):
    class Meta:
        model = StoredFile
        fields = (
            "id",
            "owner",
            "name",
            "content_type",
            "size",
            "created_at",
        )

# ----------------------------
# StoredFile admin with import-export and statistics
# ----------------------------
@admin.register(StoredFile)
class StoredFileAdmin(ImportExportModelAdmin):
    resource_class = StoredFileResource

    list_display = ("owner", "name", "content_type", "size", "created_at", "file_stats")
    search_fields = ("owner__username", "name", "content_type")
    list_filter = ("content_type", "created_at")

    # Add general statistics to changelist_view
    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}

        # General statistics
        total_files = StoredFile.objects.count()
        total_users_with_files = StoredFile.objects.values('owner').distinct().count()
        total_file_size = StoredFile.objects.aggregate(total_size_sum=Sum('size'))['total_size_sum'] or 0

        # Pass stats to extra_context
        extra_context["general_stats"] = {
            "total_files": total_files,
            "total_users_with_files": total_users_with_files,
            "total_file_size": total_file_size,
        }

        return super().changelist_view(request, extra_context=extra_context)

    # Custom method to show statistics in list_display
    def file_stats(self, obj=None):
        """
        Display general statistics in admin changelist.
        Cached to avoid repeated queries.
        """
        if not hasattr(self, 'general_stats_cache'):
            self.general_stats_cache = {
                "total_files": StoredFile.objects.count(),
                "total_users_with_files": StoredFile.objects.values('owner').distinct().count(),
                "total_file_size": StoredFile.objects.aggregate(total_size_sum=Sum('size'))['total_size_sum'] or 0,
            }

        stats = self.general_stats_cache
        return format_html(
            "<b>Total files:</b> {} | <b>Users with files:</b> {} | <b>Total size:</b> {} bytes",
            stats["total_files"], stats["total_users_with_files"], stats["total_file_size"]
        )

    file_stats.short_description = "General Statistics"
    file_stats.allow_tags = True  # optional for older Django versions

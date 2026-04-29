from django.contrib import admin
from django.db.models import Sum, Count
from django.utils.html import format_html
from import_export import resources
from import_export.admin import ImportExportModelAdmin
from .models import StoredFile


class StoredFileResource(resources.ModelResource):
    class Meta:
        model = StoredFile
        fields = ("id", "owner", "name", "content_type", "size", "created_at")


@admin.register(StoredFile)
class StoredFileAdmin(ImportExportModelAdmin):
    resource_class = StoredFileResource
    list_display = ("owner", "name", "content_type", "human_size", "created_at", "file_stats")
    search_fields = ("owner__username", "owner__email", "name", "content_type")
    list_filter = ("content_type", "created_at")
    list_select_related = ("owner",)

    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}
        agg = StoredFile.objects.aggregate(total_files=Count("id"), total_size=Sum("size"))
        extra_context["general_stats"] = {
            "total_files": agg["total_files"] or 0,
            "total_users_with_files": StoredFile.objects.values("owner").distinct().count(),
            "total_file_size_mb": round((agg["total_size"] or 0) / (1024 * 1024), 2),
        }
        return super().changelist_view(request, extra_context=extra_context)

    def human_size(self, obj):
        size = obj.size
        for unit in ("B", "KB", "MB", "GB"):
            if size < 1024:
                return f"{size:.1f} {unit}"
            size /= 1024
        return f"{size:.1f} TB"
    human_size.short_description = "Size"
    human_size.admin_order_field = "size"

    def file_stats(self, obj):
        if not hasattr(self, "_stats_cache"):
            agg = StoredFile.objects.aggregate(total=Count("id"), total_size=Sum("size"))
            self._stats_cache = {
                "total": agg["total"] or 0,
                "users": StoredFile.objects.values("owner").distinct().count(),
                "size_mb": round((agg["total_size"] or 0) / (1024 * 1024), 2),
            }
        s = self._stats_cache
        return format_html(
            "<b>Files:</b> {} | <b>Users:</b> {} | <b>Total:</b> {} MB",
            s["total"], s["users"], s["size_mb"],
        )
    file_stats.short_description = "General Statistics"

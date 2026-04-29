from django.contrib import admin
from django.utils.html import format_html
from .models import MockAPI


@admin.register(MockAPI)
class MockAPIAdmin(admin.ModelAdmin):
    list_display = (
        "owner", "title_short", "item_count", "hit_count",
        "is_active", "is_expired_display", "created_at", "mock_link",
    )
    list_filter = ("is_active", "created_at")
    search_fields = ("owner__username", "owner__email", "title", "slug", "prompt")
    readonly_fields = (
        "slug", "hit_count", "item_count", "created_at",
        "mock_link", "is_expired_display",
    )
    list_select_related = ("owner",)
    actions = ["activate", "deactivate"]

    def title_short(self, obj):
        return obj.title[:60] if obj.title else obj.slug
    title_short.short_description = "Title"

    def is_expired_display(self, obj):
        expired = obj.is_expired()
        color = "red" if expired else "green"
        label = "Expired" if expired else "Active"
        return format_html('<span style="color:{}">{}</span>', color, label)
    is_expired_display.short_description = "Expiry"

    def mock_link(self, obj):
        url = f"/api/v1/geodev-ai/mock/{obj.slug}/"
        return format_html('<a href="{}" target="_blank">{}</a>', url, url)
    mock_link.short_description = "Mock URL"

    @admin.action(description="Activate selected Mock APIs")
    def activate(self, request, queryset):
        queryset.update(is_active=True)

    @admin.action(description="Deactivate selected Mock APIs")
    def deactivate(self, request, queryset):
        queryset.update(is_active=False)

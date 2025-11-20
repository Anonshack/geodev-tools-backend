# from django.contrib import admin
# from import_export import resources
# from import_export.admin import ImportExportModelAdmin
# from .models import User
#
# class UserResource(resources.ModelResource):
#     class Meta:
#         model = User
#         fields = (
#             "id", "email", "first_name", "last_name",
#             "company_name", "phone_number",
#             "is_staff", "is_superuser", "is_active",
#             "date_joined", "last_login",
#         )
#
# @admin.action(description="Activate selected users")
# def make_active(modeladmin, request, queryset):
#     queryset.update(is_active=True)
#
#
# @admin.action(description="Deactivate selected users")
# def make_inactive(modeladmin, request, queryset):
#     queryset.update(is_active=False)
#
#
# @admin.register(User)
# class CustomUserAdmin(ImportExportModelAdmin):
#     resource_class = UserResource
#     list_display = (
#         "id", "email", "first_name", "last_name", "full_name",
#         "company_name", "phone_number",
#         "is_staff", "is_superuser", "is_active", "date_joined",
#     )
#     list_filter = ("is_active", "is_staff", "is_superuser", "company_name")
#     search_fields = ("email", "first_name", "last_name", "company_name", "phone_number")
#     ordering = ("-date_joined",)
#     readonly_fields = ("last_login", "date_joined")
#     actions = [make_active, make_inactive]
#
#     def full_name(self, obj):
#         return f"{obj.first_name or ''} {obj.last_name or ''}".strip()
#     full_name.short_description = "Full name"
#
#     def changelist_view(self, request, extra_context=None):
#         extra_context = extra_context or {}
#         extra_context["custom_filters"] = [
#             {"name": "Admins", "query": "?is_staff__exact=1"},
#             {"name": "CommonUsers", "query": "?is_staff__exact=0"},
#         ]
#         return super().changelist_view(request, extra_context=extra_context)
#
#     # def changelist_view(self, request, extra_context=None):
#     #     extra_context = extra_context or {}
#     #
#     #     extra_context["custom_filters"] = [
#     #         {"name": "Admins", "query": "?is_staff__exact=1"},
#     #         {"name": "CommonUsers", "query": "?is_staff__exact=0"},
#     #     ]
#     #
#     #     total_users = User.objects.count()
#     #     active_users = User.objects.filter(is_active=True).count()
#     #     inactive_users = User.objects.filter(is_active=False).count()
#     #     superusers = User.objects.filter(is_superuser=True).count()
#     #     staff_users = User.objects.filter(is_staff=True).count()
#     #
#     #     extra_context["general_stats"] = {
#     #         "total_users": total_users,
#     #         "active_users": active_users,
#     #         "inactive_users": inactive_users,
#     #         "superusers": superusers,
#     #         "staff_users": staff_users,
#     #     }
#     #     return super().changelist_view(request, extra_context=extra_context)
#
#
#     def get_queryset(self, request):
#         qs = super().get_queryset(request)
#         if request.user.is_superuser:
#             return qs
#         return qs.filter(is_superuser=False)
#
#     def has_module_permission(self, request):
#         return request.user.is_staff

from django.contrib import admin
from django.utils.html import format_html
from import_export import resources
from import_export.admin import ImportExportModelAdmin
from .models import User


class UserResource(resources.ModelResource):
    class Meta:
        model = User
        fields = (
            "id", "email", "first_name", "last_name",
            "company_name", "phone_number",
            "is_staff", "is_superuser", "is_active",
            "date_joined", "last_login",
        )


@admin.action(description="Activate selected users")
def make_active(modeladmin, request, queryset):
    queryset.update(is_active=True)


@admin.action(description="Deactivate selected users")
def make_inactive(modeladmin, request, queryset):
    queryset.update(is_active=False)


@admin.register(User)
class CustomUserAdmin(ImportExportModelAdmin):
    resource_class = UserResource

    list_display = (
        "id", "profile_photo", "email",
        "first_name", "last_name", "full_name",
        "company_name", "phone_number",
        "is_staff", "is_superuser", "is_active", "date_joined",
    )

    list_filter = ("is_active", "is_staff", "is_superuser", "company_name")
    search_fields = ("email", "first_name", "last_name", "company_name", "phone_number")
    ordering = ("-date_joined",)
    readonly_fields = ("last_login", "date_joined")
    actions = [make_active, make_inactive]

    def profile_photo(self, obj):
        if obj.profile_image:
            return format_html(
                '<img src="{}" width="45" height="45" style="border-radius:50%; object-fit:cover;" />',
                obj.profile_image.url
            )
        return "No Image"

    profile_photo.short_description = "Photo"

    def full_name(self, obj):
        return f"{obj.first_name or ''} {obj.last_name or ''}".strip()

    full_name.short_description = "Full name"


    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}

        extra_context["custom_filters"] = [
            {"name": "Admins", "query": "?is_staff__exact=1"},
            {"name": "CommonUsers", "query": "?is_staff__exact=0"},
        ]

        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        inactive_users = User.objects.filter(is_active=False).count()
        superusers = User.objects.filter(is_superuser=True).count()
        staff_users = User.objects.filter(is_staff=True).count()

        extra_context["general_stats"] = {
            "total_users": total_users,
            "active_users": active_users,
            "inactive_users": inactive_users,
            "superusers": superusers,
            "staff_users": staff_users,
        }

        return super().changelist_view(request, extra_context=extra_context)


    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(is_superuser=False)


    def has_module_permission(self, request):
        return request.user.is_staff

from django.contrib import admin
from .models import UserLocation

@admin.register(UserLocation)
class UserLocationAdmin(admin.ModelAdmin):
    list_display = ("user", "ip", "country", "city", "region", "created_at")
    search_fields = ("user__username", "country", "city", "ip")
    list_filter = ("country", "city", "region")

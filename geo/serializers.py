from rest_framework import serializers
from .models import UserLocation

class UserLocationSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = UserLocation
        fields = [
            "id",
            "user",
            "ip",
            "country",
            "city",
            "region",
            "latitude",
            "longitude",
            "created_at",
        ]
        read_only_fields = ["user", "ip", "country", "city", "region", "latitude", "longitude", "created_at"]

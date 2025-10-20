from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ('id', 'title', 'message', 'type', 'is_read', 'created_at')
        read_only_fields = ('is_read', 'created_at')

    def create(self, validated_data):
        request = self.context.get('request')
        if request is None or request.user is None or request.user.is_anonymous:
            raise serializers.ValidationError("Authentication required.")
        return Notification.objects.create(user=request.user, **validated_data)

from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from .models import User
from utils.email_service import send_email_notification
import logging

logger = logging.getLogger(__name__)


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ('id', 'email', 'password', 'company_name')

    def create(self, validated_data):
        user = User(
            email=validated_data['email'],
            company_name=validated_data.get('company_name', '')
        )
        user.set_password(validated_data['password'])
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'id', 'email', 'company_name', 'api_key',
            'is_active', 'is_staff', 'is_superuser',
            'date_joined', 'last_login', 'profile_image', 'bio',
            'phone_number', 'address', 'country', 'city'
        )
        read_only_fields = ("id", "email")


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    confirm_password = serializers.CharField(required=True)

    def validate(self, attrs):
        user = self.context['request'].user
        if not user.check_password(attrs['old_password']):
            raise serializers.ValidationError({"old_password": "Old password is incorrect"})
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match"})
        validate_password(attrs['new_password'], user)
        return attrs

    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()

        send_email_notification(
            subject="Your password has been changed",
            template_name="emails/password_changed.html",
            context={"user": user},
            recipient_list=[user.email],
        )
        return user

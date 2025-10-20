from django.contrib.auth.password_validation import validate_password
from utils.email_service import send_email_notification
from django.contrib.auth import get_user_model
import logging
from rest_framework import serializers
User = get_user_model()

logger = logging.getLogger(__name__)


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'company_name', 'password')

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value

    def validate_company_name(self, value):
        if not value:
            return value
        if len(value.strip()) < 3:
            raise serializers.ValidationError("Company name is too short.")
        if any(ch.isdigit() for ch in value):
            raise serializers.ValidationError("Company name cannot contain numbers.")
        if any(ch in "!@#$%^&*()_+=<>?/\\|{}[]~`" for ch in value):
            raise serializers.ValidationError("Company name cannot contain special characters.")
        if not any(ch.isalpha() for ch in value):
            raise serializers.ValidationError("Company name must contain letters.")
        fake_names = ["test", "company", "asd", "dasdsa", "unknown"]
        if value.lower() in fake_names:
            raise serializers.ValidationError("Invalid or placeholder company name.")
        return value.title()

    def create(self, validated_data):
        username = validated_data['username']
        email = validated_data['email']
        password = validated_data['password']
        company_name = validated_data.get('company_name', '')
        user = User.objects.create_user(
            email=email,
            username=username,
            password=password,
            company_name=company_name
        )
        return user



class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'id', 'email', 'first_name', 'last_name', 'company_name', 'api_key',
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
        user._password_changed = True
        user.save()

        send_email_notification(
            subject="Your password has been changed",
            template_name="emails/password_changed.html",
            context={"user": user},
            recipient_list=[user.email],
        )
        return user
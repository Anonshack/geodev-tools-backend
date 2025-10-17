from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.mail import send_mail
from .models import User

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'password', 'company_name')

    def create(self, validated_data):
        user = User(
            email=validated_data['email'],
            username=validated_data.get('username') or validated_data['email'].split('@')[0],
            company_name=validated_data.get('company_name', '')
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'company_name', 'api_key', 'is_active', 'is_staff', 'is_superuser',
            'date_joined', 'last_login', 'profile_image', 'bio',
            'phone_number', 'address', 'country', 'city'
        )
        read_only_fields = ("id", "email", "username")


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    confirm_password = serializers.CharField(required=True)

    def validate(self, attrs):
        user = self.context['request'].user
        old_password = attrs.get('old_password')
        new_password = attrs.get('new_password')
        confirm_password = attrs.get('confirm_password')

        if not user.check_password(old_password):
            raise serializers.ValidationError({"old_password": "Old password is incorrect"})

        if new_password != confirm_password:
            raise serializers.ValidationError({"confirm_password": "The new password is not same"})

        validate_password(new_password, user)

        return attrs

    def save(self, **kwargs):
        user = self.context['request'].user
        new_password = self.validated_data['new_password']
        user.set_password(new_password)
        user.save()

        send_mail(
            subject="The password has been changed",
            message=f"Hi {user.username}, You changed your password successfully",
            from_email=None,
            recipient_list=[user.email],
            fail_silently=False,
        )
        return user

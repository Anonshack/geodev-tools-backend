from rest_framework import serializers
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
        fields = ('id', 'email', 'username', 'company_name', 'api_key')

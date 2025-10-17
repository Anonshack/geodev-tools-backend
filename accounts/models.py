from django.db import models
from django.contrib.auth.models import AbstractUser
import secrets

class User(AbstractUser):
    company_name = models.CharField(max_length=255, blank=True, null=True)
    api_key = models.CharField(max_length=255, blank=True, null=True)
    profile_image = models.ImageField(upload_to='profiles/', blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)

    def generate_api_key(self):
        key = secrets.token_urlsafe(32)
        self.api_key = key
        self.save(update_fields=['api_key'])
        return key

    def __str__(self):
        return self.username

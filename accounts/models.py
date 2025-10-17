from django.db import models
from django.contrib.auth.models import AbstractUser
import secrets

class User(AbstractUser):
    email = models.EmailField(unique=True)
    company_name = models.CharField(max_length=255, blank=True, null=True)
    api_key = models.CharField(max_length=64, blank=True, null=True)

    def generate_api_key(self):
        key = secrets.token_urlsafe(32)
        self.api_key = key
        self.save(update_fields=['api_key'])
        return key

    def __str__(self):
        return self.username

import secrets
from django.db import models
from django.conf import settings
from django.utils import timezone


def _make_slug():
    return secrets.token_urlsafe(12)


class MockAPI(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="mock_apis",
    )
    slug = models.CharField(max_length=24, unique=True, db_index=True, default=_make_slug)
    title = models.CharField(max_length=200, blank=True)
    prompt = models.TextField()
    data = models.JSONField(default=list)
    item_count = models.PositiveIntegerField(default=0)
    hit_count = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    admin_disabled = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def is_expired(self):
        return self.expires_at is not None and timezone.now() > self.expires_at

    def __str__(self):
        return f"{self.owner.username} — {self.title or self.slug}"

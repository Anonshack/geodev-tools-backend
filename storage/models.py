from django.db import models
from django.conf import settings
from django.contrib.auth.models import User


def upload_to(instance, filename):
    from django.utils import timezone
    t = timezone.now()
    return f'uploads/{t.year}/{t.month:02d}/{t.day:02d}/{filename}'


class StoredFile(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='stored_files',
        null=True,
        blank=True
    )
    file = models.FileField(upload_to=upload_to)
    name = models.CharField(max_length=255, blank=True)
    content_type = models.CharField(max_length=128, blank=True)
    size = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if self.file and not self.name:
            self.name = self.file.name.split('/')[-1]
        try:
            self.size = self.file.size
        except Exception:
            pass
        super().save(*args, **kwargs)

    @property
    def url(self):
        try:
            return self.file.url
        except Exception:
            return ''

    def __str__(self):
        return f"{self.name} ({self.size} bytes)"

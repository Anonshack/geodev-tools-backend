from rest_framework import serializers
from .models import StoredFile

ALLOWED_CONTENT_TYPES = {
    # images
    "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml", "image/tiff",
    # documents
    "application/pdf", "text/plain", "text/csv",
    "application/json",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    # archives
    "application/zip", "application/x-zip-compressed",
    # geo formats
    "application/octet-stream",
    "application/x-shapefile",
    "application/geo+json",
    "application/geopackage+sqlite3",
}

MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB


class UploadSerializer(serializers.Serializer):
    file = serializers.FileField()
    description = serializers.CharField(required=False, allow_blank=True, default="")

    def validate_file(self, f):
        if f.size > MAX_FILE_SIZE:
            raise serializers.ValidationError(
                f"File size {f.size // (1024*1024)} MB exceeds the {MAX_FILE_SIZE // (1024*1024)} MB limit."
            )
        ct = getattr(f, "content_type", "") or ""
        if ct and ct not in ALLOWED_CONTENT_TYPES:
            raise serializers.ValidationError(
                f"File type '{ct}' is not allowed."
            )
        return f


class StoredFileSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField(read_only=True)
    owner_username = serializers.CharField(source="owner.username", read_only=True)
    owner_email = serializers.EmailField(source="owner.email", read_only=True)

    class Meta:
        model = StoredFile
        fields = (
            "id", "owner_username", "owner_email",
            "name", "description", "content_type", "size", "created_at", "url",
        )
        read_only_fields = (
            "id", "owner_username", "owner_email",
            "name", "content_type", "size", "created_at", "url",
        )

    def get_url(self, obj):
        request = self.context.get("request")
        try:
            raw_url = obj.file.url
        except Exception:
            return None
        if request and not raw_url.startswith("http"):
            return request.build_absolute_uri(raw_url)
        return raw_url


class StoredFileUpdateSerializer(serializers.ModelSerializer):
    """Allows renaming display name and updating description only."""
    class Meta:
        model = StoredFile
        fields = ("name", "description")

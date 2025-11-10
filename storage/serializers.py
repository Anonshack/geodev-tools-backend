from rest_framework import serializers
from .models import StoredFile


class UploadSerializer(serializers.Serializer):
    file = serializers.FileField()


class StoredFileSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = StoredFile
        fields = ('id', 'owner', 'name', 'content_type', 'size', 'created_at', 'url')
        read_only_fields = ('id', 'owner', 'name', 'content_type', 'size', 'created_at', 'url')

    def get_url(self, obj):
        request = self.context.get('request')
        if hasattr(obj, 'file') and obj.file:
            url = obj.file.url
            if request and not url.startswith('http'):
                return request.build_absolute_uri(url)
            return url
        return None

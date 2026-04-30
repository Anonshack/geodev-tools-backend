from rest_framework import serializers
from .models import MockAPI

MAX_COUNT = 500
MIN_COUNT = 1


class MockAPICreateSerializer(serializers.Serializer):
    prompt = serializers.CharField(
        min_length=10,
        max_length=1000,
        help_text=(
            "Describe the data you need. Single endpoint example: "
            "'Generate 20 users with fields: id, name, email, age, country, avatar_url'. "
            "Multi-endpoint example: "
            "'Create an API with Users (id, name, email, country, avatar_url) and Books (book_id, book_name, author, date, pdf_url)'."
        ),
    )
    count = serializers.IntegerField(
        min_value=MIN_COUNT,
        max_value=MAX_COUNT,
        default=10,
        help_text=f"Number of items per endpoint (1–{MAX_COUNT}).",
    )
    title = serializers.CharField(max_length=200, required=False, allow_blank=True)
    expires_in_days = serializers.IntegerField(
        min_value=1,
        max_value=365,
        required=False,
        allow_null=True,
        default=None,
        help_text="Optional: link expiry in days. Leave empty for no expiry.",
    )


class MockAPISerializer(serializers.ModelSerializer):
    mock_url = serializers.SerializerMethodField()
    is_expired = serializers.SerializerMethodField()
    endpoints = serializers.SerializerMethodField()
    endpoint_urls = serializers.SerializerMethodField()

    class Meta:
        model = MockAPI
        fields = (
            "id", "slug", "title", "prompt",
            "item_count", "hit_count", "is_active",
            "created_at", "expires_at", "is_expired",
            "mock_url", "endpoints", "endpoint_urls",
        )
        read_only_fields = fields

    def get_mock_url(self, obj):
        request = self.context.get("request")
        path = f"/api/v1/geodev-ai/mock/{obj.slug}/"
        return request.build_absolute_uri(path) if request else path

    def get_is_expired(self, obj):
        return obj.is_expired()

    def get_endpoints(self, obj):
        if isinstance(obj.data, dict):
            return list(obj.data.keys())
        return None

    def get_endpoint_urls(self, obj):
        if not isinstance(obj.data, dict):
            return None
        request = self.context.get("request")
        result = {}
        for key in obj.data.keys():
            path = f"/api/v1/geodev-ai/mock/{obj.slug}/{key}/"
            result[key] = request.build_absolute_uri(path) if request else path
        return result


class MockAPIDetailSerializer(MockAPISerializer):
    class Meta(MockAPISerializer.Meta):
        fields = MockAPISerializer.Meta.fields + ("data",)
        read_only_fields = fields


class MockAPIAdminSerializer(MockAPISerializer):
    owner = serializers.CharField(source='owner.username', read_only=True)
    owner_id = serializers.IntegerField(source='owner.id', read_only=True)

    class Meta(MockAPISerializer.Meta):
        fields = MockAPISerializer.Meta.fields + ("owner", "owner_id")

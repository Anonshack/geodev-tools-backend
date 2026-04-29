from rest_framework import serializers
from .models import MockAPI

MAX_COUNT = 500
MIN_COUNT = 1


class MockAPICreateSerializer(serializers.Serializer):
    prompt = serializers.CharField(
        min_length=10,
        max_length=1000,
        help_text=(
            "Describe the data you need. "
            "Example: 'Generate 50 users with fields: id, name, email, age, country'"
        ),
    )
    count = serializers.IntegerField(
        min_value=MIN_COUNT,
        max_value=MAX_COUNT,
        default=10,
        help_text=f"Number of items to generate (1–{MAX_COUNT}).",
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

    class Meta:
        model = MockAPI
        fields = (
            "id", "slug", "title", "prompt",
            "item_count", "hit_count", "is_active",
            "created_at", "expires_at", "is_expired", "mock_url",
        )
        read_only_fields = fields

    def get_mock_url(self, obj):
        request = self.context.get("request")
        path = f"/api/v1/geodev-ai/mock/{obj.slug}/"
        if request:
            return request.build_absolute_uri(path)
        return path

    def get_is_expired(self, obj):
        return obj.is_expired()


class MockAPIDetailSerializer(MockAPISerializer):
    """Includes the full generated data — only for owner detail view."""
    class Meta(MockAPISerializer.Meta):
        fields = MockAPISerializer.Meta.fields + ("data",)
        read_only_fields = fields

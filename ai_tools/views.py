from django.db.models import F
from django.utils import timezone
from datetime import timedelta
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination

from .models import MockAPI
from .serializers import (
    MockAPICreateSerializer, MockAPISerializer,
    MockAPIDetailSerializer, MockAPIAdminSerializer,
)
from .ai_generator import generate_mock_data


class MockAPIPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


class GenerateMockAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="Generate a Mock API",
        operation_description=(
            "Describe the data structure you need. AI generates the data and returns "
            "a permanent public URL you can use in your frontend project.\n\n"
            "**Example prompt:** `Generate 50 products with fields: id, name, price, category, in_stock`"
        ),
        request_body=MockAPICreateSerializer,
        responses={
            201: openapi.Response(
                description="Mock API created",
                examples={
                    "application/json": {
                        "id": 1,
                        "slug": "abc123xyz",
                        "title": "Generate 50 products...",
                        "item_count": 50,
                        "mock_url": "https://yourdomain.com/api/v1/geodev-ai/mock/abc123xyz/",
                        "created_at": "2025-11-01T12:00:00Z",
                    }
                },
            ),
            400: "Validation error or AI generation failed",
        },
    )
    def post(self, request):
        serializer = MockAPICreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        prompt = serializer.validated_data["prompt"]
        count = serializer.validated_data["count"]
        title = serializer.validated_data.get("title") or prompt[:100]
        expires_in_days = serializer.validated_data.get("expires_in_days")

        data, error = generate_mock_data(prompt, count)
        if error:
            return Response({"detail": error}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        expires_at = None
        if expires_in_days:
            expires_at = timezone.now() + timedelta(days=expires_in_days)

        if isinstance(data, dict):
            item_count = sum(len(v) for v in data.values() if isinstance(v, list))
        else:
            item_count = len(data)

        mock_api = MockAPI.objects.create(
            owner=request.user,
            prompt=prompt,
            title=title,
            data=data,
            item_count=item_count,
            expires_at=expires_at,
        )

        out = MockAPIDetailSerializer(mock_api, context={"request": request})
        return Response(out.data, status=status.HTTP_201_CREATED)


class MockAPIPublicView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="Fetch Mock API data (public)",
        operation_description=(
            "Public endpoint — no authentication needed. "
            "Returns the JSON array generated for this slug. "
            "Use this URL directly in your frontend: `fetch('...')`"
        ),
        responses={
            200: openapi.Response(description="JSON array of generated items"),
            404: "Not found or inactive",
            410: "Link has expired",
        },
    )
    def get(self, request, slug):
        try:
            mock_api = MockAPI.objects.get(slug=slug, is_active=True)
        except MockAPI.DoesNotExist:
            return Response({"detail": "Mock API not found or inactive."}, status=status.HTTP_404_NOT_FOUND)

        if mock_api.is_expired():
            return Response({"detail": "This mock API link has expired."}, status=status.HTTP_410_GONE)

        MockAPI.objects.filter(pk=mock_api.pk).update(hit_count=F("hit_count") + 1)
        return Response(mock_api.data)


class MockAPIEndpointView(APIView):
    """Sub-endpoint for multi-endpoint APIs: /mock/<slug>/<endpoint>/"""
    permission_classes = [AllowAny]

    def get(self, request, slug, endpoint):
        try:
            mock_api = MockAPI.objects.get(slug=slug, is_active=True)
        except MockAPI.DoesNotExist:
            return Response({"detail": "Mock API not found or inactive."}, status=status.HTTP_404_NOT_FOUND)

        if mock_api.is_expired():
            return Response({"detail": "This mock API link has expired."}, status=status.HTTP_410_GONE)

        if not isinstance(mock_api.data, dict):
            return Response(
                {"detail": "This is a single-endpoint API.", "url": request.build_absolute_uri(f"/api/v1/geodev-ai/mock/{slug}/")},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if endpoint not in mock_api.data:
            return Response(
                {"detail": f"Endpoint '{endpoint}' not found.", "available": list(mock_api.data.keys())},
                status=status.HTTP_404_NOT_FOUND,
            )

        MockAPI.objects.filter(pk=mock_api.pk).update(hit_count=F("hit_count") + 1)
        return Response(mock_api.data[endpoint])


class UserMockAPIListView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MockAPISerializer
    pagination_class = MockAPIPagination

    def get_queryset(self):
        return MockAPI.objects.filter(owner=self.request.user).select_related("owner")

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx

    @swagger_auto_schema(
        operation_summary="List my Mock APIs",
        operation_description="Returns all Mock APIs created by the authenticated user.",
        responses={200: MockAPISerializer(many=True)},
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class UserMockAPIDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_own(self, request, pk):
        try:
            return MockAPI.objects.get(pk=pk, owner=request.user)
        except MockAPI.DoesNotExist:
            return None

    @swagger_auto_schema(
        operation_summary="Get Mock API detail (with data)",
        responses={200: MockAPIDetailSerializer()},
    )
    def get(self, request, pk):
        obj = self._get_own(request, pk)
        if not obj:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(MockAPIDetailSerializer(obj, context={"request": request}).data)

    @swagger_auto_schema(
        operation_summary="Toggle active/inactive",
        responses={200: MockAPISerializer()},
    )
    def patch(self, request, pk):
        obj = self._get_own(request, pk)
        if not obj:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        obj.is_active = not obj.is_active
        obj.save(update_fields=["is_active"])
        return Response(MockAPISerializer(obj, context={"request": request}).data)

    @swagger_auto_schema(
        operation_summary="Delete Mock API",
        responses={204: "Deleted"},
    )
    def delete(self, request, pk):
        obj = self._get_own(request, pk)
        if not obj:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class RegenerateMockAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="Regenerate Mock API data",
        operation_description=(
            "Regenerates the data for an existing Mock API using the original prompt. "
            "The slug and URL remain the same — only the data is refreshed."
        ),
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                "count": openapi.Schema(
                    type=openapi.TYPE_INTEGER,
                    description="New item count (optional, uses original count if omitted)",
                )
            },
        ),
        responses={200: MockAPIDetailSerializer()},
    )
    def post(self, request, pk):
        try:
            obj = MockAPI.objects.get(pk=pk, owner=request.user)
        except MockAPI.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        # For multi-endpoint, use per-endpoint count; for single, use total
        if isinstance(obj.data, dict) and obj.data:
            num_endpoints = len(obj.data)
            default_count = max(1, obj.item_count // num_endpoints)
        else:
            default_count = obj.item_count

        count = request.data.get("count", default_count) or default_count
        try:
            count = max(1, min(500, int(count)))
        except (ValueError, TypeError):
            count = default_count

        data, error = generate_mock_data(obj.prompt, count)
        if error:
            return Response({"detail": error}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        if isinstance(data, dict):
            item_count = sum(len(v) for v in data.values() if isinstance(v, list))
        else:
            item_count = len(data)

        obj.data = data
        obj.item_count = item_count
        obj.save(update_fields=["data", "item_count"])

        return Response(MockAPIDetailSerializer(obj, context={"request": request}).data)


# ── Admin views ───────────────────────────────────────────────────────────────

class AdminMockAPIListView(ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = MockAPIAdminSerializer
    pagination_class = MockAPIPagination
    queryset = MockAPI.objects.select_related("owner").order_by("-created_at")

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx


class AdminMockAPIDetailView(APIView):
    permission_classes = [IsAdminUser]

    def _get(self, pk):
        try:
            return MockAPI.objects.select_related("owner").get(pk=pk)
        except MockAPI.DoesNotExist:
            return None

    def patch(self, request, pk):
        obj = self._get(pk)
        if not obj:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        obj.is_active = not obj.is_active
        obj.save(update_fields=["is_active"])
        return Response(MockAPIAdminSerializer(obj, context={"request": request}).data)

    def delete(self, request, pk):
        obj = self._get(pk)
        if not obj:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

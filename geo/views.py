from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.pagination import PageNumberPagination
from rest_framework import generics, status
from .models import UserLocation
from .serializers import UserLocationSerializer
from .utils import get_client_ip, get_geo_info


class LocationPagination(PageNumberPagination):
    page_size = 30
    page_size_query_param = "page_size"
    max_page_size = 200


class SaveUserLocationView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="Detect and save current location",
        operation_description=(
            "Detects caller's IP, fetches geo data, and saves (or updates) "
            "the user's location record. Returns the detected location."
        ),
        responses={200: UserLocationSerializer()},
    )
    def get(self, request):
        ip = get_client_ip(request)
        geo = get_geo_info(ip)

        if not geo:
            return Response(
                {"error": "Could not retrieve geo information for this IP."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        try:
            location, created = UserLocation.objects.update_or_create(
                user=request.user,
                defaults={
                    "ip": geo["ip"],
                    "country": geo.get("country"),
                    "city": geo.get("city"),
                    "region": geo.get("region"),
                    "latitude": geo.get("latitude"),
                    "longitude": geo.get("longitude"),
                },
            )
        except UserLocation.MultipleObjectsReturned:
            # Keep only the most recent record, delete the rest
            locations = UserLocation.objects.filter(user=request.user).order_by("-created_at")
            location = locations.first()
            locations.exclude(pk=location.pk).delete()
            for field, value in {
                "ip": geo["ip"],
                "country": geo.get("country"),
                "city": geo.get("city"),
                "region": geo.get("region"),
                "latitude": geo.get("latitude"),
                "longitude": geo.get("longitude"),
            }.items():
                setattr(location, field, value)
            location.save()
            created = False

        serializer = UserLocationSerializer(location)
        return Response(
            {
                "message": "Location saved." if created else "Location updated.",
                "location": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class UserOwnLocationsView(generics.ListAPIView):
    serializer_class = UserLocationSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = LocationPagination

    @swagger_auto_schema(
        operation_summary="Get own location history",
        operation_description="Returns the authenticated user's saved location records.",
        responses={200: UserLocationSerializer(many=True)},
    )
    def get_queryset(self):
        return UserLocation.objects.filter(user=self.request.user).order_by("-created_at")


class UserLocationListView(generics.ListAPIView):
    serializer_class = UserLocationSerializer
    permission_classes = [IsAdminUser]
    queryset = UserLocation.objects.select_related("user").order_by("-created_at")
    pagination_class = LocationPagination

    @swagger_auto_schema(
        operation_summary="[Admin] List all user locations",
        operation_description="Returns all users' location records. Admin only.",
        responses={200: UserLocationSerializer(many=True)},
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

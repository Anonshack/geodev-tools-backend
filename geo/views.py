from drf_yasg.utils import swagger_auto_schema
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework import generics
from .models import UserLocation
from .serializers import UserLocationSerializer
from .utils import get_client_ip, get_geo_info


class SaveUserLocationView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        responses={200: UserLocationSerializer()},
        operation_description="It can save users geolocation and response data"
    )

    def get(self, request):
        ip = get_client_ip(request)
        geo = get_geo_info(ip)

        if not geo:
            return Response({"error": "Could not retrieve geo information"}, status=400)
        location, created = UserLocation.objects.update_or_create(
            user=request.user,
            defaults={
                "ip": geo.get("ip"),
                "country": geo.get("country"),
                "city": geo.get("city"),
                "region": geo.get("region"),
                "latitude": geo.get("latitude"),
                "longitude": geo.get("longitude"),
            }
        )
        message = "New location created ✅" if created else "Location updated 🔄"
        return Response({"message": message})


class UserLocationListView(generics.ListAPIView):
    serializer_class = UserLocationSerializer
    permission_classes = [IsAdminUser]
    queryset = UserLocation.objects.all().order_by("-created_at")

    @swagger_auto_schema(
        operation_description="For admins and superusers",
        responses={
            200: UserLocationSerializer(many=True),
        }
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


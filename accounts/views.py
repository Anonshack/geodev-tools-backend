from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django_countries import countries


class CountryListView(APIView):
    permission_classes = [permissions.AllowAny]

    @swagger_auto_schema(
        operation_summary="Get the list of all countries",
        operation_description="This endpoint returns a list of all countries with their codes and names. "
                              "Frontend developers can use this data to populate dropdowns or country selectors.",
        responses={
            200: openapi.Response(
                description="OK",
                examples={
                    "application/json": {
                        "success": True,
                        "code": 0,
                        "reason": "Countries retrieved successfully",
                        "data": [
                            {"code": "UZ", "name": "Uzbekistan"},
                            {"code": "US", "name": "United States"},
                            {"code": "TR", "name": "Turkey"}
                        ],
                        "errors": []
                    }
                }
            ),
            400: openapi.Response(
                description="Bad Request",
                examples={
                    "application/json": {
                        "success": False,
                        "code": 400,
                        "reason": "Invalid request",
                        "data": [],
                        "errors": [
                            {"field": "request", "message": "Invalid request format"}
                        ]
                    }
                }
            ),
        },
    )
    def get(self, request):
        country_list = [{"code": code, "name": name} for code, name in countries]
        return Response({
            "success": True,
            "code": 0,
            "reason": "Countries retrieved successfully",
            "data": country_list,
            "errors": []
        })

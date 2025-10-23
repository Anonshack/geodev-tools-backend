from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView


class CountryListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        country_list = [{"code": code, "name": name} for code, name in countries]
        return Response(country_list)
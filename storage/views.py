import os
from django.http import FileResponse, Http404
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework import status
from .models import StoredFile
from .serializers import UploadSerializer, StoredFileSerializer, StoredFileUpdateSerializer


class FilePagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


class UploadFileView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    @swagger_auto_schema(
        operation_summary="Upload a file",
        operation_description=f"Uploads a file (max 50 MB). Returns the saved file metadata.",
        request_body=UploadSerializer,
        responses={201: StoredFileSerializer()},
    )
    def post(self, request):
        serializer = UploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        f = serializer.validated_data["file"]
        stored = StoredFile.objects.create(
            owner=request.user,
            file=f,
            name=getattr(f, "name", ""),
            description=serializer.validated_data.get("description", ""),
            content_type=getattr(f, "content_type", "") or "",
            size=getattr(f, "size", 0),
        )
        return Response(
            StoredFileSerializer(stored, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class UserFilesListView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = StoredFileSerializer
    pagination_class = FilePagination

    def get_queryset(self):
        return StoredFile.objects.filter(owner=self.request.user).select_related("owner")

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx


class UserFileDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_own_file(self, request, pk):
        try:
            return StoredFile.objects.select_related("owner").get(pk=pk, owner=request.user)
        except StoredFile.DoesNotExist:
            return None

    @swagger_auto_schema(
        operation_summary="Get own file detail",
        responses={200: StoredFileSerializer()},
    )
    def get(self, request, pk):
        stored = self._get_own_file(request, pk)
        if not stored:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(StoredFileSerializer(stored, context={"request": request}).data)

    @swagger_auto_schema(
        operation_summary="Update file name or description",
        request_body=StoredFileUpdateSerializer,
        responses={200: StoredFileSerializer()},
    )
    def patch(self, request, pk):
        stored = self._get_own_file(request, pk)
        if not stored:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = StoredFileUpdateSerializer(stored, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(StoredFileSerializer(stored, context={"request": request}).data)

    @swagger_auto_schema(
        operation_summary="Delete own file",
        responses={204: "File deleted."},
    )
    def delete(self, request, pk):
        stored = self._get_own_file(request, pk)
        if not stored:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        stored.file.delete(save=False)
        stored.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class FileDownloadView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="Download own file",
        manual_parameters=[
            openapi.Parameter("pk", openapi.IN_PATH, description="File ID", type=openapi.TYPE_INTEGER),
        ],
        responses={200: "File stream"},
    )
    def get(self, request, pk):
        try:
            stored = StoredFile.objects.get(pk=pk, owner=request.user)
        except StoredFile.DoesNotExist:
            raise Http404("File not found.")

        try:
            fh = stored.file.open("rb")
        except Exception:
            raise Http404("File not available.")

        safe_name = os.path.basename(stored.name)
        response = FileResponse(fh, content_type=stored.content_type or "application/octet-stream")
        response["Content-Disposition"] = f'attachment; filename="{safe_name}"'
        return response


# ── Admin views ───────────────────────────────────────────────────────────────

class AdminFilesListView(ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = StoredFileSerializer
    pagination_class = FilePagination
    queryset = StoredFile.objects.select_related("owner").order_by("-created_at")

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx

    @swagger_auto_schema(
        operation_summary="[Admin] List all files",
        responses={200: StoredFileSerializer(many=True)},
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class AdminFileDetailView(RetrieveAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = StoredFileSerializer
    queryset = StoredFile.objects.select_related("owner")

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx

    @swagger_auto_schema(
        operation_summary="[Admin] Get any file by ID",
        responses={200: StoredFileSerializer()},
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class AdminFileDeleteView(APIView):
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
        operation_summary="[Admin] Delete any file",
        responses={204: "File deleted."},
    )
    def delete(self, request, pk):
        try:
            stored = StoredFile.objects.get(pk=pk)
        except StoredFile.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        stored.file.delete(save=False)
        stored.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

from django.http import FileResponse, Http404
from drf_yasg.utils import swagger_auto_schema
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from drf_yasg import openapi
from .models import StoredFile
from .serializers import UploadSerializer, StoredFileSerializer


class UploadFileView(APIView):
    """
    POST: upload a file (authenticated)
    returns StoredFileSerializer
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    @swagger_auto_schema(
        operation_description="Upload file part",
        request_body=UploadSerializer,
        responses={201: StoredFileSerializer},
    )
    def post(self, request, *args, **kwargs):
        serializer = UploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        f = serializer.validated_data['file']

        stored = StoredFile.objects.create(
            owner=request.user,
            file=f,
            name=getattr(f, 'name', ''),
            content_type=getattr(f, 'content_type', None) or '',
            size=getattr(f, 'size', 0),
        )

        out = StoredFileSerializer(stored, context={'request': request})
        return Response(out.data, status=status.HTTP_201_CREATED)


class UserFilesListView(ListAPIView):
    """
    GET: list authenticated user's files
    """
    permission_classes = [IsAuthenticated]
    serializer_class = StoredFileSerializer

    def get_queryset(self):
        return StoredFile.objects.filter(owner=self.request.user)


class AllFilesListViewForAdmin(ListAPIView):
    """
    GET: list authenticated user's files for only admins
    """
    permission_classes = [IsAuthenticated]
    serializer_class = StoredFileSerializer

    def get_queryset(self):
        return StoredFile.objects.filter(owner=self.request.user)


class PublicFileRetrieveView(RetrieveAPIView):
    """
    GET: retrieve file metadata (and absolute URL) by id
    public access allowed for now; change to IsAuthenticated if needed
    """
    permission_classes = [AllowAny]
    serializer_class = StoredFileSerializer
    queryset = StoredFile.objects.all()


class FileDownloadView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_description="Download a file by ID",
        manual_parameters=[
            openapi.Parameter('pk', openapi.IN_PATH, description="File ID", type=openapi.TYPE_INTEGER)
        ],
        responses={200: 'File will be downloaded'}
    )
    def get(self, request, pk):
        try:
            stored = StoredFile.objects.get(pk=pk)
            response = FileResponse(stored.file.open('rb'))
            response['Content-Disposition'] = f'attachment; filename="{stored.name}"'
            return response
        except StoredFile.DoesNotExist:
            raise Http404("There are not files")

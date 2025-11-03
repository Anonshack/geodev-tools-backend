from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status

from .models import StoredFile
from .serializers import UploadSerializer, StoredFileSerializer

class UploadFileView(APIView):
    """
    POST: upload a file (authenticated)
    returns StoredFileSerializer
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        serializer = UploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        f = serializer.validated_data['file']
        stored = StoredFile.objects.create(
            owner=request.user,
            file=f,
            name=getattr(f, 'name', ''),
            content_type=getattr(f, 'content_type', '') or f.content_type if hasattr(f, 'content_type') else ''
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


class PublicFileRetrieveView(RetrieveAPIView):
    """
    GET: retrieve file metadata (and absolute URL) by id
    public access allowed for now; change to IsAuthenticated if needed
    """
    permission_classes = [AllowAny]
    serializer_class = StoredFileSerializer
    queryset = StoredFile.objects.all()

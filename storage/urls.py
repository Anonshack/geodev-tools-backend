from django.urls import path
from .views import (
    UploadFileView,
    UserFilesListView,
    PublicFileRetrieveView,
    FileDownloadView,
    GetAllFiles
)

urlpatterns = [
    path('upload/', UploadFileView.as_view(), name='storage-upload'),
    path('get-all-files/', UserFilesListView.as_view(), name='storage-my-files'),
    path('me/', UserFilesListView.as_view(), name='storage-my-files'),
    path('files/<int:pk>/download/', FileDownloadView.as_view(), name='file-download'),
    path('<int:pk>/', PublicFileRetrieveView.as_view(), name='storage-file-detail'),
]

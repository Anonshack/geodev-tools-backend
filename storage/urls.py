from django.urls import path
from .views import UploadFileView, UserFilesListView, PublicFileRetrieveView

urlpatterns = [
    path('upload/', UploadFileView.as_view(), name='storage-upload'),
    path('me/', UserFilesListView.as_view(), name='storage-my-files'),
    path('<int:pk>/', PublicFileRetrieveView.as_view(), name='storage-file-detail'),
]

from django.urls import path
from .views import (
    UploadFileView,
    UserFilesListView,
    UserFileDetailView,
    FileDownloadView,
    PublicFileView,
    PublicFileDownloadView,
    AdminFilesListView,
    AdminFileDetailView,
    AdminFileDeleteView,
)

urlpatterns = [
    # User (authenticated)
    path("upload/", UploadFileView.as_view(), name="storage-upload"),
    path("files/", UserFilesListView.as_view(), name="storage-my-files"),
    path("files/<int:pk>/", UserFileDetailView.as_view(), name="storage-file-detail"),
    path("files/<int:pk>/download/", FileDownloadView.as_view(), name="storage-file-download"),

    # Public share links (no auth)
    path("public/<int:pk>/", PublicFileView.as_view(), name="storage-public"),
    path("public/<int:pk>/download/", PublicFileDownloadView.as_view(), name="storage-public-download"),

    # Admin
    path("admin/files/", AdminFilesListView.as_view(), name="admin-storage-list"),
    path("admin/files/<int:pk>/", AdminFileDetailView.as_view(), name="admin-storage-detail"),
    path("admin/files/<int:pk>/delete/", AdminFileDeleteView.as_view(), name="admin-storage-delete"),
]

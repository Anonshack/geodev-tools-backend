from django.urls import path
from .views import (
    UploadFileView,
    UserFilesListView,
    UserPublicFileRetrieveView,
    FileDownloadView,
    AllFilesListViewForAdmin,
    GetAllFilesForAdminBY_ID
)

urlpatterns = [
    path('upload-for_user/', UploadFileView.as_view(), name='storage-upload'),
    path('me/', UserFilesListView.as_view(), name='storage-my-files'),
    path('files/<int:pk>/download/',
         FileDownloadView.as_view(), name='file-download'),
    path('user-file-by_file-id/<int:pk>/',
         UserPublicFileRetrieveView.as_view(), name='user-file-by_file-id'),

    # for admins
    path('all-users-files-for_admin/',
             AllFilesListViewForAdmin.as_view(), name='all-users-files-for_admin'),
    path('user-file-by_file_id-for-admins/<int:pk>/',
             GetAllFilesForAdminBY_ID.as_view(), name='user-file-by_file_id-for-admins'),
]

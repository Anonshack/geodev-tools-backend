from django.urls import path
from .views import DynamicAPI, DynamicAPIData

urlpatterns = [
    path('ai_tools/generate/',
         DynamicAPI.as_view()), # generata prompt
    path('api/<str:slug>/',
         DynamicAPIData.as_view()),
]

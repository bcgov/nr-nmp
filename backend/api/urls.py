from django.urls import path
from . import views

urlpatterns = [
    path('crop_types/', views.crop_types),
]

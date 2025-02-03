from django.urls import path
from . import views

urlpatterns = [
    path('croptypes/', views.crop_types),
]

from django.urls import path
from rest_framework import routers
from .views import CropsViewset

urlpatterns = [
    path('croptypes/', CropsViewset.as_view({'get': 'cropTypes'})),
]

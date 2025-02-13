from django.urls import path
from rest_framework import routers
from .views import CropsViewset

urlpatterns = [
    path('croptypes/', CropsViewset.as_view({'get': 'cropTypes'})),
    path('crops/', CropsViewset.as_view({'get': 'crops'}), name='crops'),
    path('previouscroptypes/', CropsViewset.as_view({'get': 'previousCropTypes'})),
]

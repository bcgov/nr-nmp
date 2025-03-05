from django.urls import path
from rest_framework import routers
from .views import SharedViewset

urlpatterns = [
    path('regions/', SharedViewset.as_view({'get': 'regions'})),
    path('regions/<int:regionId>/', SharedViewset.as_view({'get': 'regions'})),
    path('subregions/', SharedViewset.as_view({'get': 'subregions'})),
    path('subregions/<int:regionId>/', SharedViewset.as_view({'get': 'subregions'})),
]

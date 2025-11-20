from django.urls import path

from .views import SharedViewset

urlpatterns = [
    path('regions/', SharedViewset.as_view({'get': 'regions'})),
    path('regions/<int:regionId>/', SharedViewset.as_view({'get': 'regions'})),
    path('subregions/', SharedViewset.as_view({'get': 'subregions'})),
    path('subregions/<int:regionId>/', SharedViewset.as_view({'get': 'subregions'})),
    path('subregions/<int:regionId>/<int:subregionId>/', SharedViewset.as_view({'get': 'subregions'})),
    path('nitratecredit/', SharedViewset.as_view({'get': 'nitratecredit'})),
]

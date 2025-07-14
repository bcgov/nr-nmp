from django.urls import path

from .views import ManuresViewset

urlpatterns = [
    path('manures/', ManuresViewset.as_view({'get': 'manures'}), name='manures'),
    path('manures/<int:pk>/', ManuresViewset.as_view({'get': 'manure'}), name='manure'),
    path('solidmaterialsconversionfactors/', ManuresViewset.as_view({'get': 'solidMaterialsConversionFactors'})),
    path('liquidmaterialsconversionfactors/', ManuresViewset.as_view({'get': 'liquidMaterialsConversionFactors'})),
    path('units/', ManuresViewset.as_view({'get': 'units'}), name='units'),
    path('units/<str:unit>/', ManuresViewset.as_view({'get': 'units'}), name='unit_detail'),
    path('nmineralization/', ManuresViewset.as_view({'get': 'nMineralization'}), name='n_mineralization'),
]

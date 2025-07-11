from django.urls import path

from .views import ManuresViewset

urlpatterns = [
    path('manures/', ManuresViewset.as_view({'get': 'manures'}), name='manures'),
    path('manures/<int:pk>/', ManuresViewset.as_view({'get': 'manure'}), name='manure'),
    path('solidmaterialsconversionfactors/', ManuresViewset.as_view({'get': 'solidMaterialsConversionFactors'})),
    path('liquidmaterialsconversionfactors/', ManuresViewset.as_view({'get': 'liquidMaterialsConversionFactors'})),
]

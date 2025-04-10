from django.urls import path

from .views import ManuresViewset

urlpatterns = [
    path('manures/', ManuresViewset.as_view({'get': 'manures'}), name='manures'),
    path('solidmaterialsconversionfactors/', ManuresViewset.as_view({'get': 'solidMaterialsConversionFactors'})),
    path('liquidmaterialsconversionfactors/', ManuresViewset.as_view({'get': 'liquidMaterialsConversionFactors'})),
]

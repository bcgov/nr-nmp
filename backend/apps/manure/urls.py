from django.urls import path
from rest_framework import routers
from .views import SolidMaterialsConversionFactorsViewset

urlpatterns = [
    path('solidmaterialsconversionfactors/', SolidMaterialsConversionFactorsViewset.as_view({'get': 'solidMaterialsConversionFactors'})),
    path('liquidmaterialsconversionfactors/', SolidMaterialsConversionFactorsViewset.as_view({'get': 'liquidMaterialsConversionFactors'})),
]

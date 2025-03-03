from django.urls import path
from rest_framework import routers
from .views import CropsViewset

urlpatterns = [
    path('croptypes/', CropsViewset.as_view({'get': 'cropTypes'})),
    path('crops/', CropsViewset.as_view({'get': 'crops'}), name='crops'),
    path('previouscroptypes/', CropsViewset.as_view({'get': 'previousCropTypes'})),
    path('cropsoiltestphosphorousregions/', CropsViewset.as_view({'get': 'cropSoilTestPhosphorousRegions'})),
    path('cropsoiltestphosphorousregions/<int:cropid>/<int:soiltestphosphorousregioncode>/', CropsViewset.as_view({'get': 'cropSoilTestPhosphorousRegions'})),
    path('soiltestphosphorousrecommendation/', CropsViewset.as_view({'get': 'soilTestPhosphorousRecommendation'})),
    path('soiltestphosphorouskelonwaranges/', CropsViewset.as_view({'get': 'soilTestPhosphorousKelownaRanges'})),
    path('soiltestmethods/', CropsViewset.as_view({'get': 'soilTestMethods'})),
    path('cropsconversionfactors/', CropsViewset.as_view({'get': 'conversionFactors'})),
]


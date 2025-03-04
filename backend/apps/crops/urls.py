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
    path('soiltestpotassiumkelonwaranges/', CropsViewset.as_view({'get': 'soilTestPotassiumKelownaRanges'})),
    path('soiltestpotassiumrecommendation/', CropsViewset.as_view({'get': 'soilTestPotassiumRecommendation'})),
    path('cropsoilpotassiumregions/', CropsViewset.as_view({'get': 'cropSoilPotassiumRegions'})),
    path('cropsoilpotassiumregions/<int:cropid>/<int:soiltestpotassiumregioncode>/', CropsViewset.as_view({'get': 'cropSoilPotassiumRegions'})),
]


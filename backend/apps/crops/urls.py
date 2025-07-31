from django.urls import path

from .views import CropsViewset

urlpatterns = [
    path('croptypes/', CropsViewset.as_view({'get': 'cropTypes'})),
    path('croptypes/<int:id>/', CropsViewset.as_view({'get': 'cropTypes'})),
    path('crops/', CropsViewset.as_view({'get': 'crops'})),
    path('crops/<int:id>/', CropsViewset.as_view({'get': 'crops'})),
    path('previouscroptypes/', CropsViewset.as_view({'get': 'previousCropTypes'})),
    path('previouscroptypes/<int:id>/', CropsViewset.as_view({'get': 'previousCropTypes'})),
    path('cropsoiltestphosphorousregions/', CropsViewset.as_view({'get': 'cropSoilTestPhosphorousRegions'})),
    path('cropsoiltestphosphorousregions/<int:cropid>/<int:soiltestphosphorousregioncode>/',
         CropsViewset.as_view({'get': 'cropSoilTestPhosphorousRegions'})),
    path('soiltestphosphorousrecommendation/', CropsViewset.as_view({'get': 'soilTestPhosphorousRecommendation'})),
    path('soiltestphosphorouskelonwaranges/', CropsViewset.as_view({'get': 'soilTestPhosphorousKelownaRanges'})),
    path('soiltestmethods/', CropsViewset.as_view({'get': 'soilTestMethods'})),
    path('cropsconversionfactors/', CropsViewset.as_view({'get': 'conversionFactors'})),
    path('soiltestpotassiumkelonwaranges/', CropsViewset.as_view({'get': 'soilTestPotassiumKelownaRanges'})),
    path('soiltestpotassiumrecommendation/', CropsViewset.as_view({'get': 'soilTestPotassiumRecommendation'})),
    path('cropsoilpotassiumregions/', CropsViewset.as_view({'get': 'cropSoilPotassiumRegions'})),
    path('cropsoilpotassiumregions/<int:cropid>/<int:soiltestpotassiumregioncode>/',
         CropsViewset.as_view({'get': 'cropSoilPotassiumRegions'})),
    path('cropyields/', CropsViewset.as_view({'get': 'cropYields'})),
    path('cropyields/<int:cropid>/<int:locationid>/', CropsViewset.as_view({'get': 'cropYields'})),
    path('nitrogenrecommendation/', CropsViewset.as_view({'get': 'nitrogenRecommendation'})),
    path('nitrogenrecommendation/<int:id>/', CropsViewset.as_view({'get': 'nitrogenRecommendation'})),
    path('plantage/', CropsViewset.as_view({'get': 'plantAge'})),
    path('plantsperacre/', CropsViewset.as_view({'get': 'plantsPerAcre'})),
    path('distancebetweenplants/', CropsViewset.as_view({'get': 'distanceBetweenPlants'})),
    path('wherewillprunningsgo/', CropsViewset.as_view({'get': 'whereWillPrunningsGo'})),
]

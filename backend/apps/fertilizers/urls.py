from django.urls import path

from .views import FertilizersViewset

urlpatterns = [
    path('fertilizertypes/', FertilizersViewset.as_view({'get': 'fertilizerTypes'})),
    path('fertilizerunits/', FertilizersViewset.as_view({'get': 'fertilizerUnits'})),
    path('fertilizers/', FertilizersViewset.as_view({'get': 'fertilizers'}), name='fertilizers'),
    path('liquidfertilizerdensities/', FertilizersViewset.as_view({'get': 'liquidFertilizerDensities'})),
    path('densityunits/', FertilizersViewset.as_view({'get': 'densityUnits'})),

]

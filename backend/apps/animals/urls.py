from django.urls import path
from rest_framework import routers
from .views import AnimalsViewset

urlpatterns = [
    path('animals/', AnimalsViewset.as_view({'get': 'animals'})),
    path('animal_subtypes/', AnimalsViewset.as_view({'get': 'animalSubtypes'})),
    path('animal_subtypes/<int:animalId>/', AnimalsViewset.as_view({'get': 'animalSubtypes'})),
]
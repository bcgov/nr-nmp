from django.urls import path
from rest_framework import routers
from .views import FertilizersViewset

urlpatterns = [
    path('fertilizertypes/', FertilizersViewset.as_view({'get': 'fertilizertypes'})),
    path('fertilizers/', FertilizersViewset.as_view({'get': 'fertilizers'}), name='fertilizers'),
]

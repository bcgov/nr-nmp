from rest_framework import serializers
from .models import Fertilizers
from .models import FertilizerTypes

class FertilizerTypesSerializer(serializers.ModelSerializer):
    class Meta:
        model = FertilizerTypes
        fields = '__all__'

class FertilizersSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fertilizers
        fields = '__all__'
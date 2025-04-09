from rest_framework import serializers

from .models import Fertilizers, FertilizerTypes, FertilizerUnits


class FertilizerTypesSerializer(serializers.ModelSerializer):
    class Meta:
        model = FertilizerTypes
        fields = '__all__'


class FertilizerUnitsSerializer(serializers.ModelSerializer):
    class Meta:
        model = FertilizerUnits
        fields = '__all__'


class FertilizersSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fertilizers
        fields = '__all__'

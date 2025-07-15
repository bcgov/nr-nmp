from rest_framework import serializers

from .models import Fertilizers, FertilizerTypes, FertilizerUnits, LiquidFertilizerDensities, DensityUnits


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


class LiquidFertilizerDensitiesSerializer(serializers.ModelSerializer):
    class Meta:
        model = LiquidFertilizerDensities
        fields = '__all__'


class DensityUnitsSerializer(serializers.ModelSerializer):
    class Meta:
        model = DensityUnits
        fields = '__all__'

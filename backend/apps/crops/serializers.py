from rest_framework import serializers

from .models import (
    CropTypes, Crops, PreviousCropTypes, CropSoilTestPhosphorousRegions,
    SoilTestPhosphorousRecommendation, SoilTestPhosphorousKelownaRanges,
    SoilTestMethods, ConversionFactors, SoilTestPotassiumKelownaRanges,
    SoilTestPotassiumRecommendation, CropSoilPotassiumRegions,
    CropYields, NitrogenRecommendation, PlantAge, PlantsPerAcre,
    DistanceBetweenPlants, WhereWillPrunningsGo
)


class CropTypesSerializer(serializers.ModelSerializer):
    class Meta:
        model = CropTypes
        fields = '__all__'


class CropsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Crops
        fields = '__all__'


class PreviousCropTypesSerializer(serializers.ModelSerializer):
    class Meta:
        model = PreviousCropTypes
        fields = '__all__'


class CropSoilTestPhosphorousRegionsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CropSoilTestPhosphorousRegions
        fields = '__all__'


class SoilTestPhosphorousRecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = SoilTestPhosphorousRecommendation
        fields = '__all__'


class SoilTestPhosphorousKelownaRangesSerializer(serializers.ModelSerializer):
    class Meta:
        model = SoilTestPhosphorousKelownaRanges
        fields = '__all__'


class SoilTestMethodsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SoilTestMethods
        fields = '__all__'


class ConversionFactorsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConversionFactors
        fields = '__all__'


class SoilTestPotassiumKelownaRangesSerializer(serializers.ModelSerializer):
    class Meta:
        model = SoilTestPotassiumKelownaRanges
        fields = '__all__'


class SoilTestPotassiumRecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = SoilTestPotassiumRecommendation
        fields = '__all__'


class CropSoilPotassiumRegionsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CropSoilPotassiumRegions
        fields = '__all__'


class CropYieldsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CropYields
        fields = '__all__'


class NitrogenRecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = NitrogenRecommendation
        fields = '__all__'

class PlantAgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlantAge
        fields = '__all__'

class PlantsPerAcreSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlantsPerAcre
        fields = '__all__'


class DistanceBetweenPlantsSerializer(serializers.ModelSerializer):
    class Meta:
        model = DistanceBetweenPlants
        fields = '__all__'


class WhereWillPrunningsGoSerializer(serializers.ModelSerializer):
    class Meta:
        model = WhereWillPrunningsGo
        fields = '__all__'

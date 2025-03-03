from rest_framework import serializers
from .models import *

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

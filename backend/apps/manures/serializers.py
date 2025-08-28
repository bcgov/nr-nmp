from rest_framework import serializers

from .models import (
    Manures, SolidMaterialsConversionFactors, LiquidMaterialsConversionFactors,
    Units, NitrogenMineralization, AmmoniaRetentions
)


class ManuresSerializer(serializers.ModelSerializer):
    class Meta:
        model = Manures
        fields = '__all__'


class SolidMaterialsConversionFactorsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SolidMaterialsConversionFactors
        fields = '__all__'


class LiquidMaterialsConversionFactorsSerializer(serializers.ModelSerializer):
    class Meta:
        model = LiquidMaterialsConversionFactors
        fields = '__all__'


class UnitsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Units
        fields = '__all__'


class NMineralizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = NitrogenMineralization
        fields = '__all__'

class AmmoniaRetentionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AmmoniaRetentions
        fields = '__all__'

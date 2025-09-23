from rest_framework import serializers

from .models import (
    Manures, SolidMaterialsConversionFactors, LiquidMaterialsConversionFactors,
    Units, NitrogenMineralization, AmmoniaRetentions, PreviousYearManureApplications,
    LiquidMaterialApplicationUsGallonsPerAcreRateConversions, SolidMaterialApplicationTonPerAcreRateConversions
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


class PreviousYearManureApplicationsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PreviousYearManureApplications
        fields = '__all__'

class LiquidMaterialApplicationUsGallonsPerAcreRateConversionsSerializer(serializers.ModelSerializer):
    class Meta:
        model = LiquidMaterialApplicationUsGallonsPerAcreRateConversions
        fields = '__all__'

class SolidMaterialApplicationTonPerAcreRateConversionsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SolidMaterialApplicationTonPerAcreRateConversions
        fields = '__all__'

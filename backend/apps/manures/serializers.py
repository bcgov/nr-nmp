from rest_framework import serializers

from .models import Manures, SolidMaterialsConversionFactors, LiquidMaterialsConversionFactors, Units


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

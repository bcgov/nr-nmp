from rest_framework import serializers
from .models import *

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

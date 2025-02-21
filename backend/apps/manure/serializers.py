from rest_framework import serializers
from .models import SolidMaterialsConversionFactors

class SolidMaterialsConversionFactorsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SolidMaterialsConversionFactors
        fields = '__all__'

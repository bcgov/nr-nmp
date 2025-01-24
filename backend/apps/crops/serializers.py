from rest_framework import serializers
from .models import CropTypes
from .models import Crops

class CropTypesSerializer(serializers.ModelSerializer):
    class Meta:
        model = CropTypes
        fields = '__all__'

class CropsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Crops
        fields = '__all__'


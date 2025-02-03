from rest_framework import serializers
from crops.models import CropTypes

class CropTypesSerializer(serializers.ModelSerializer):
    class Meta:
        model = CropTypes
        fields = '__all__'

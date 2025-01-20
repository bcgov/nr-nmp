from rest_framework import serializers
from .models import CropTypes

class CropTypesSerializer(serializers.ModelSerializer):
    class Meta:
        model = CropTypes
        fields = '__all__'

from rest_framework import serializers
from .models import Fertilizers

class FertilizersSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fertilizers
        fields = '__all__'

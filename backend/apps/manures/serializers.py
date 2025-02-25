from rest_framework import serializers
from .models import Manures

class ManuresSerializer(serializers.ModelSerializer):
    class Meta:
        model = Manures
        fields = '__all__'
from rest_framework import serializers
from .models import *

class AnimalsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Animals
        fields = '__all__'

class AnimalSubtypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnimalSubtype
        fields = '__all__'

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.crops.models import CropTypes
from apps.crops.models import Crops
from apps.crops.serializers import CropTypesSerializer
from apps.crops.serializers import CropsSerializer
from apps.crops.serializers import CropTypesSerializer
from apps.animals.models import *
from apps.animals.serializers import *

class APIViewSet(viewsets.ViewSet):
    @action(detail=True, methods=['get'])
    def cropTypes(self, request, pk=None):
        crop_types = CropTypes.objects.all()
        serializer = CropTypesSerializer(crop_types, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    @action(detail=True, methods=['get'])
    def crops(self, request, pk=None):
        crops = Crops.objects.all()
        serializer = CropsSerializer(crops, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    @action(detail=True, methods=['get'])
    def animals(self, request, pk=None):
        animals = Animals.objects.all()
        serializer = AnimalsSerializer(animals, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

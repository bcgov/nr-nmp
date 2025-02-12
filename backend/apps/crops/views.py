from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import *
from .serializers import *

class CropsViewset(viewsets.ViewSet):

    @action(detail=True, methods=['get'])
    def cropTypes(self, request):
        crop_types = CropTypes.objects.all()
        serializer = CropTypesSerializer(crop_types, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['get'])
    def crops(self, request, pk=None):
        crops = Crops.objects.all()
        serializer = CropsSerializer(crops, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['get'])
    def previousCropsTypes(self, request):
        previous_crops_types = PreviousCropsTypes.objects.all()
        serializer = PreviousCropsTypesSerializer(previous_crops_types, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

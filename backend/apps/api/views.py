from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.crops.models import CropTypes
from apps.crops.serializers import CropTypesSerializer

class APIViewSet(viewsets.ViewSet):
    @action(detail=True, methods=['get'])
    def cropTypes(self, request, pk=None):
        crop_types = CropTypes.objects.all()
        serializer = CropTypesSerializer(crop_types, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

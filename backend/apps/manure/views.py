from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import *
from .serializers import *

class SolidMaterialsConversionFactorsViewset(viewsets.ViewSet):
    @action(detail=True, methods=['get'])
    def solidMaterialsConversionFactors(self, request):
        solid_materials_conversion_factors = SolidMaterialsConversionFactors.objects.all()
        serializer = SolidMaterialsConversionFactorsSerializer(solid_materials_conversion_factors, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

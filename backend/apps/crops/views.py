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
    def previousCropTypes(self, request):
        previous_crops_types = PreviousCropTypes.objects.all()
        serializer = PreviousCropTypesSerializer(previous_crops_types, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['get'])
    def cropSoilTestPhosphorousRegions(self, request, cropId=None, SoilTestPhosphorousRegionCode=None):
        crop_soil_test_phosphorous_regions = None
        if cropId == None and SoilTestPhosphorousRegionCode == None:
            crop_soil_test_phosphorous_regions = CropSoilTestPhosphorousRegions.objects.all()
        else:
            crop_soil_test_phosphorous_regions = CropSoilTestPhosphorousRegions.objects.filter(cropId=cropId, SoilTestPhosphorousRegionCode=SoilTestPhosphorousRegionCode)
        serializer = CropSoilTestPhosphorousRegionsSerializer(crop_soil_test_phosphorous_regions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['get'])
    def soilTestPhosphorousRecommendation(self, request):
        soil_test_phosphorous_recommendation = SoilTestPhosphorousRecommendation.objects.all()
        serializer = SoilTestPhosphorousRecommendationSerializer(soil_test_phosphorous_recommendation, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['get'])
    def soilTestPhosphorousKelownaRanges(self, request):
        soil_test_phosphorous_kelowna_ranges = SoilTestPhosphorousKelownaRanges.objects.all()
        serializer = SoilTestPhosphorousKelownaRangesSerializer(soil_test_phosphorous_kelowna_ranges, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['get'])
    def soilTestMethods(self, request):
        soil_test_methods = SoilTestMethods.objects.all()
        serializer = SoilTestMethodsSerializer(soil_test_methods, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['get'])
    def conversionFactors(self, request):
        conversion_factors = ConversionFactors.objects.all()
        serializer = ConversionFactorsSerializer(conversion_factors, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import (
    CropTypes, Crops, PreviousCropTypes, CropSoilTestPhosphorousRegions, SoilTestPhosphorousRanges,
    SoilTestPhosphorousRecommendation, SoilTestPhosphorousKelownaRanges,
    SoilTestMethods, ConversionFactors, SoilTestPotassiumKelownaRanges, SoilTestPotassiumRanges,
    SoilTestPotassiumRecommendation, CropSoilPotassiumRegions,
    CropYields, NitrogenRecommendation, PlantAge, PlantsPerAcre,
    DistanceBetweenPlants, WhereWillPruningsGo
)
from .serializers import (
    CropTypesSerializer, CropsSerializer, PreviousCropTypesSerializer,
    CropSoilTestPhosphorousRegionsSerializer, SoilTestPhosphorousRangesSerializer, SoilTestPhosphorousRecommendationSerializer,
    SoilTestPhosphorousKelownaRangesSerializer, SoilTestMethodsSerializer,
    ConversionFactorsSerializer, SoilTestPotassiumKelownaRangesSerializer, SoilTestPotassiumRangesSerializer,
    SoilTestPotassiumRecommendationSerializer, CropSoilPotassiumRegionsSerializer,
    CropYieldsSerializer, NitrogenRecommendationSerializer, PlantAgeSerializer, PlantsPerAcreSerializer,
    DistanceBetweenPlantsSerializer, WhereWillPruningsGoSerializer
)


class CropsViewset(viewsets.ViewSet):

    @action(detail=True, methods=['get'])
    def cropTypes(self, request, id=None):  # pylint: disable=redefined-builtin
        crop_types = None
        if id is None:
            crop_types = CropTypes.objects.all()
        else:
            crop_types = CropTypes.objects.filter(id=id)
        serializer = CropTypesSerializer(crop_types, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def crops(self, request, id=None):  # pylint: disable=redefined-builtin
        crops = None
        if id is None:
            crops = Crops.objects.all()
        else:
            crops = Crops.objects.filter(id=id)
        serializer = CropsSerializer(crops, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def previousCropTypes(self, request, id=None):  # pylint: disable=redefined-builtin
        previous_crops_types = None
        if id is None:
            previous_crops_types = PreviousCropTypes.objects.all()
        else:
            previous_crops_types = PreviousCropTypes.objects.filter(id=id)
        serializer = PreviousCropTypesSerializer(previous_crops_types, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def cropSoilTestPhosphorousRegions(self, request, cropid=None, soiltestphosphorousregioncode=None):
        crop_soil_test_phosphorous_regions = None
        if cropid is None and soiltestphosphorousregioncode is None:
            crop_soil_test_phosphorous_regions = CropSoilTestPhosphorousRegions.objects.all()
        else:
            crop_soil_test_phosphorous_regions = CropSoilTestPhosphorousRegions.objects.filter(
                cropid=cropid, soiltestphosphorousregioncode=soiltestphosphorousregioncode)
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
    def soilTestPhosphorousRanges(self, request):
        soil_test_phosphorous_ranges = SoilTestPhosphorousRanges.objects.all()
        serializer = SoilTestPhosphorousRangesSerializer(soil_test_phosphorous_ranges, many=True)
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

    @action(detail=True, methods=['get'])
    def soilTestPotassiumRecommendation(self, request):
        soil_test_potassium_recommendation = SoilTestPotassiumRecommendation.objects.all()
        serializer = SoilTestPotassiumRecommendationSerializer(soil_test_potassium_recommendation, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def cropSoilPotassiumRegions(self, request, cropid=None, soiltestpotassiumregioncode=None):
        crop_soil_potassium_regions = None
        if cropid is None and soiltestpotassiumregioncode is None:
            crop_soil_potassium_regions = CropSoilPotassiumRegions.objects.all()
        else:
            crop_soil_potassium_regions = CropSoilPotassiumRegions.objects.filter(
                cropid=cropid, soiltestpotassiumregioncode=soiltestpotassiumregioncode)
        serializer = CropSoilPotassiumRegionsSerializer(crop_soil_potassium_regions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def soilTestPotassiumKelownaRanges(self, request):
        soil_test_potassium_kelowna_ranges = SoilTestPotassiumKelownaRanges.objects.all()
        serializer = SoilTestPotassiumKelownaRangesSerializer(soil_test_potassium_kelowna_ranges, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def soilTestPotassiumRanges(self, request):
        soil_test_potassium_ranges = SoilTestPotassiumRanges.objects.all()
        serializer = SoilTestPotassiumRangesSerializer(soil_test_potassium_ranges, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def cropYields(self, request, cropid=None, locationid=None):
        crop_yields = None
        if cropid is None and locationid is None:
            crop_yields = CropYields.objects.all()
        else:
            crop_yields = CropYields.objects.filter(cropid=cropid, locationid=locationid)
        serializer = CropYieldsSerializer(crop_yields, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def nitrogenRecommendation(self, request, id=None):  # pylint: disable=redefined-builtin
        nitrogen_recommendation = None
        if id is None:
            nitrogen_recommendation = NitrogenRecommendation.objects.all()
        else:
            nitrogen_recommendation = NitrogenRecommendation.objects.filter(id=id)
        serializer = NitrogenRecommendationSerializer(nitrogen_recommendation, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def plantAge(self, request):
        plant_age = PlantAge.objects.all()
        serializer = PlantAgeSerializer(plant_age, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def plantsPerAcre(self, request):
        plants_per_acre = PlantsPerAcre.objects.all()
        serializer = PlantsPerAcreSerializer(plants_per_acre, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def distanceBetweenPlants(self, request):
        distance_between_plants = DistanceBetweenPlants.objects.all()
        serializer = DistanceBetweenPlantsSerializer(distance_between_plants, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def whereWillPruningsGo(self, request):
        where_will_prunings_go = WhereWillPruningsGo.objects.all()
        serializer = WhereWillPruningsGoSerializer(where_will_prunings_go, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

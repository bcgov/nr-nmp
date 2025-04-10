from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Animals, AnimalSubtype, Breed
from .serializers import AnimalsSerializer, AnimalSubtypeSerializer, BreedSerializer


class AnimalsViewset(viewsets.ViewSet):

    @action(detail=True, methods=['get'])
    def animals(self, request):
        animals = Animals.objects.all()
        serializer = AnimalsSerializer(animals, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def animalSubtypes(self, request, animalId=None):
        animals = None
        if animalId is None:
            animals = AnimalSubtype.objects.all()
        else:
            animals = AnimalSubtype.objects.filter(animalid=animalId)
        serializer = AnimalSubtypeSerializer(animals, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def breeds(self, request):
        breeds = Breed.objects.all()
        serializer = BreedSerializer(breeds, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

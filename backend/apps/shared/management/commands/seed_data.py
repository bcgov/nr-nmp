from django.core.management.base import BaseCommand
from apps.crops.models import Crops, CropTypes
from apps.animals.models import Animals, AnimalSubtype, Breed
from apps.shared.models import Regions, Subregion

class Command(BaseCommand):
    help = 'Seeds the database with initial data'

    def handle(self, *args, **options):
        self.stdout.write('Seeding database...')
        
        # Check if data already exists to avoid duplicates
        if Regions.objects.exists():
            self.stdout.write(self.style.WARNING('Data already exists. Skipping seeding.'))
            return
            
        # Example of creating regions
        region1 = Regions.objects.create(
            id=1,
            name='Sample Region 1',
            soiltestphosphorousregioncd=1,
            soiltestpotassiumregioncd=1,
            locationid=1,
            sortorder=1
        )
        
        region2 = Regions.objects.create(
            id=2,
            name='Sample Region 2',
            soiltestphosphorousregioncd=2,
            soiltestpotassiumregioncd=2,
            locationid=2,
            sortorder=2
        )
        
        # Example of creating subregions
        Subregion.objects.create(
            id=1,
            name='Sample Subregion 1',
            annualprecipitation=1000,
            annualprecipitationocttomar=500,
            regionid=region1.id
        )
        
        Subregion.objects.create(
            id=2,
            name='Sample Subregion 2',
            annualprecipitation=1200,
            annualprecipitationocttomar=600,
            regionid=region2.id
        )
        
        # Example of creating crop types
        crop_type1 = CropTypes.objects.create(
            id=1,
            name='Sample Crop Type 1',
            covercrop=False,
            crudeproteinrequired=True,
            customcrop=False,
            modifynitrogen=True
        )
        
        # Example of creating crops
        Crops.objects.create(
            id=1,
            cropname='Sample Crop 1',
            croptypeid=crop_type1.id,
            yieldcd=5.0,
            cropremovalfactornitrogen=2.0,
            cropremovalfactorp2o5=1.0,
            cropremovalfactork2o=3.0,
            nitrogenrecommendationid=1,
            nitrogenrecommendationpoundperacre=100.0,
            nitrogenrecommendationupperlimitpoundperacre=120.0,
            previouscropcode=1,
            sortnumber=1,
            manureapplicationhistory=1,
            harvestbushelsperton=20.0
        )
        
        # Example of creating animal data
        animal1 = Animals.objects.create(
            id=1, 
            name='Sample Animal 1',
            usesortorder=True
        )
        
        AnimalSubtype.objects.create(
            id=1,
            name='Sample Subtype 1',
            liquidpergalperanimalperday=5.0,
            solidpergalperanimalperday=3.0,
            solidperpoundperanimalperday=2.0,
            solidliquidseparationpercentage=50,
            washwater=1.0,
            milkproduction=10.0,
            animalid=animal1.id,
            sortorder=1
        )
        
        Breed.objects.create(
            id=1,
            breedname='Sample Breed 1',
            animalid=animal1.id,
            breedmanurefactor=1.5
        )
        
        self.stdout.write(self.style.SUCCESS('Successfully seeded database!')) 
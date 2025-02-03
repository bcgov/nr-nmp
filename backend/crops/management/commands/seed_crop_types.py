# backend/crops/management/commands/seed_crop_types.py
import csv
import os
from django.core.management.base import BaseCommand
from crops.models import CropTypes

class Command(BaseCommand):
    help = 'Seed the CropTypes table with data from CropTypes.csv'

    def handle(self, *args, **kwargs):
        # Get the absolute path to the CSV file
        base_dir = os.path.dirname(os.path.abspath(__file__))
        csv_file_path = os.path.join(base_dir, '../../../seedData/CropTypes.csv')

        # Open and read the CSV file
        with open(csv_file_path, newline='') as csvfile:
            reader = csv.DictReader(csvfile)
            headers = reader.fieldnames
            if headers[0].startswith('\ufeff'):
                headers[0] = headers[0][1:]
            print("CSV Headers:", headers)
            for row in reader:
                CropTypes.objects.create(
                    id=row[headers[0]],
                    name=row['Name'],
                    covercrop=row['CoverCrop'].lower() == 'true',
                    crudeproteinrequired=row['CrudeProteinRequired'].lower() == 'true',
                    customcrop=row['CustomCrop'].lower() == 'true',
                    modifynitrogen=row['ModifyNitrogen'].lower() == 'true'
                )
        self.stdout.write(self.style.SUCCESS('Successfully seeded CropTypes table'))

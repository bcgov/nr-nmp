from django.core.management.base import BaseCommand
from django.db import connection

class Command(BaseCommand):
    help = 'Ensures seed data is loaded regardless of migration state'
    
    def handle(self, *args, **options):
        # Check if data exists
        with connection.cursor() as cursor:
            cursor.execute('SELECT COUNT(*) FROM animals')
            count = cursor.fetchone()[0]
        
        if count == 0:
            self.stdout.write('No data found. Loading seed data...')
            # Run the seed migration function directly
            from apps.shared.migrations.0002_seed_database import seed_database
            from django.apps import apps
            from django.db import connection
            seed_database(apps, connection.schema_editor())
            self.stdout.write(self.style.SUCCESS('Seed data loaded successfully'))
        else:
            self.stdout.write('Data already exists. Skipping seed.')

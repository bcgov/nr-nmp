from django.core.management.base import BaseCommand
from django.db import connection as django_connection
import importlib.util
import sys
import os

class Command(BaseCommand):
    help = 'Ensures seed data is loaded regardless of migration state'
    
    def handle(self, *args, **options):
        # Check if data exists
        with django_connection.cursor() as cursor:
            cursor.execute('SELECT COUNT(*) FROM animals')
            count = cursor.fetchone()[0]
        
        if count == 0:
            self.stdout.write('No data found. Loading seed data...')
            
            # Import the migration file properly
            migration_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 
                                        'migrations', '0002_seed_database.py')
            
            spec = importlib.util.spec_from_file_location(
                "seed_module", 
                migration_path
            )
            seed_module = importlib.util.module_from_spec(spec)
            sys.modules["seed_module"] = seed_module
            spec.loader.exec_module(seed_module)
            
            # Now use the imported function
            from django.apps import apps
            seed_module.seed_database(apps, django_connection.schema_editor())
            
            self.stdout.write(self.style.SUCCESS('Seed data loaded successfully'))
        else:
            self.stdout.write('Data already exists. Skipping seed.')

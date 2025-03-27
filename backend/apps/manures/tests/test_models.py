from django.test import TestCase
from django.db.utils import IntegrityError
from ..models import Manures, SolidMaterialsConversionFactors, LiquidMaterialsConversionFactors

class ManuresTests(TestCase):
    def setUp(self):
        self.manure = Manures.objects.create(
            id=1,
            name="Test Manure",
            manureclass="Livestock",
            solidliquid="Solid",
            moisture="Dry",
            nitrogen=10.5,
            ammonia=5.2,
            phosphorous=3.4,
            potassium=2.7,
            drymatterid=1,
            nmineralizationid=1,
            sortnum=1,
            cubicyardconversion=1.5,
            nitrate=2.1,
            defaultsolidmoisture=20
        )

    def test_manure_creation(self):
        """Test that a manure can be created with all required fields"""
        self.assertEqual(self.manure.name, "Test Manure")
        self.assertEqual(self.manure.manureclass, "Livestock")
        self.assertEqual(self.manure.solidliquid, "Solid")
        self.assertEqual(self.manure.moisture, "Dry")
        self.assertEqual(self.manure.nitrogen, 10.5)
        self.assertEqual(self.manure.ammonia, 5.2)
        self.assertEqual(self.manure.phosphorous, 3.4)
        self.assertEqual(self.manure.potassium, 2.7)
        self.assertEqual(self.manure.drymatterid, 1)
        self.assertEqual(self.manure.nmineralizationid, 1)
        self.assertEqual(self.manure.sortnum, 1)
        self.assertEqual(self.manure.cubicyardconversion, 1.5)
        self.assertEqual(self.manure.nitrate, 2.1)
        self.assertEqual(self.manure.defaultsolidmoisture, 20)
    
    def test_duplicate_id_constraint(self):
        """Test that creating a manure with a duplicate ID raises an error"""
        with self.assertRaises(IntegrityError):
            Manures.objects.create(
                id=1,  # Same ID as in setUp
                name="Another Manure",
                manureclass="Poultry",
                solidliquid="Liquid",
                moisture="Wet",
                nitrogen=8.0,
                ammonia=4.0,
                phosphorous=2.0,
                potassium=1.5,
                drymatterid=2,
                nmineralizationid=2,
                sortnum=2,
                cubicyardconversion=2.0,
                nitrate=1.0,
                defaultsolidmoisture=30
            )
            
    def test_float_values(self):
        """Test that float values can be stored with different precisions"""
        manure_with_precision = Manures.objects.create(
            id=2,
            name="Precision Manure",
            manureclass="Livestock",
            solidliquid="Solid",
            moisture="Dry",
            nitrogen=10.56789,
            ammonia=5.23456,
            phosphorous=3.45678,
            potassium=2.78901,
            drymatterid=1,
            nmineralizationid=1,
            sortnum=1,
            cubicyardconversion=1.56789,
            nitrate=2.12345,
            defaultsolidmoisture=20
        )
        
        # Retrieve from database to verify precision
        manure_from_db = Manures.objects.get(id=2)
        self.assertEqual(manure_from_db.nitrogen, 10.56789)
        self.assertEqual(manure_from_db.ammonia, 5.23456)
        self.assertEqual(manure_from_db.phosphorous, 3.45678)
        self.assertEqual(manure_from_db.potassium, 2.78901)
        self.assertEqual(manure_from_db.cubicyardconversion, 1.56789)
        self.assertEqual(manure_from_db.nitrate, 2.12345)

class SolidMaterialsConversionFactorsTests(TestCase):
    def setUp(self):
        self.conversion_factor = SolidMaterialsConversionFactors.objects.create(
            id=1,
            inputunit=1,
            inputunitname="Cubic Yard",
            cubicyardsoutput="1.0",
            cubicmetersoutput="0.76455",
            metrictonsoutput="0.5"
        )

    def test_solid_conversion_factor_creation(self):
        """Test that a solid materials conversion factor can be created"""
        self.assertEqual(self.conversion_factor.inputunit, 1)
        self.assertEqual(self.conversion_factor.inputunitname, "Cubic Yard")
        self.assertEqual(self.conversion_factor.cubicyardsoutput, "1.0")
        self.assertEqual(self.conversion_factor.cubicmetersoutput, "0.76455")
        self.assertEqual(self.conversion_factor.metrictonsoutput, "0.5")
    
    def test_string_precision(self):
        """Test that string-based numeric values can store full precision"""
        conversion_factor = SolidMaterialsConversionFactors.objects.create(
            id=2,
            inputunit=2,
            inputunitname="Cubic Foot",
            cubicyardsoutput="0.037037037037037",
            cubicmetersoutput="0.0283168",
            metrictonsoutput="0.018518518518519"
        )
        
        # Retrieve from database to verify precision is maintained
        factor_from_db = SolidMaterialsConversionFactors.objects.get(id=2)
        self.assertEqual(factor_from_db.cubicyardsoutput, "0.037037037037037")
        self.assertEqual(factor_from_db.cubicmetersoutput, "0.0283168")
        self.assertEqual(factor_from_db.metrictonsoutput, "0.018518518518519")

class LiquidMaterialsConversionFactorsTests(TestCase):
    def setUp(self):
        self.conversion_factor = LiquidMaterialsConversionFactors.objects.create(
            id=1,
            inputunit=1,
            inputunitname="US Gallon",
            usgallonsoutput="1.0"
        )

    def test_liquid_conversion_factor_creation(self):
        """Test that a liquid materials conversion factor can be created"""
        self.assertEqual(self.conversion_factor.inputunit, 1)
        self.assertEqual(self.conversion_factor.inputunitname, "US Gallon")
        self.assertEqual(self.conversion_factor.usgallonsoutput, "1.0")
    
    def test_various_liquid_units(self):
        """Test creating conversion factors for various liquid units"""
        # Imperial Gallon
        imperial_gallon = LiquidMaterialsConversionFactors.objects.create(
            id=2,
            inputunit=2,
            inputunitname="Imperial Gallon",
            usgallonsoutput="1.20095"
        )
        
        # Liter
        liter = LiquidMaterialsConversionFactors.objects.create(
            id=3,
            inputunit=3,
            inputunitname="Liter",
            usgallonsoutput="0.26417"
        )
        
        # Cubic Meter
        cubic_meter = LiquidMaterialsConversionFactors.objects.create(
            id=4,
            inputunit=4,
            inputunitname="Cubic Meter",
            usgallonsoutput="264.17"
        )
        
        # Verify all were created correctly
        self.assertEqual(imperial_gallon.inputunitname, "Imperial Gallon")
        self.assertEqual(imperial_gallon.usgallonsoutput, "1.20095")
        
        self.assertEqual(liter.inputunitname, "Liter")
        self.assertEqual(liter.usgallonsoutput, "0.26417")
        
        self.assertEqual(cubic_meter.inputunitname, "Cubic Meter")
        self.assertEqual(cubic_meter.usgallonsoutput, "264.17") 
from django.db.utils import IntegrityError
from django.test import TestCase

from ..models import Fertilizers, FertilizerTypes, FertilizerUnits


class FertilizerTypesTests(TestCase):
    def setUp(self):
        self.fertilizer_type = FertilizerTypes.objects.create(
            id=1,
            name="Granular",
            dryliquid="Dry",
            custom=False
        )

    def test_fertilizer_type_creation(self):
        """Test that a fertilizer type can be created with all required fields"""
        self.assertEqual(self.fertilizer_type.name, "Granular")
        self.assertEqual(self.fertilizer_type.dryliquid, "Dry")
        self.assertFalse(self.fertilizer_type.custom)

    def test_duplicate_id_constraint(self):
        """Test that creating a fertilizer type with a duplicate ID raises an error"""
        with self.assertRaises(IntegrityError):
            FertilizerTypes.objects.create(
                id=1,  # Same ID as in setUp
                name="Solution",
                dryliquid="Liquid",
                custom=False
            )

    def test_multiple_fertilizer_types(self):
        """Test creating multiple fertilizer types"""
        liquid_type = FertilizerTypes.objects.create(
            id=2,
            name="Solution",
            dryliquid="Liquid",
            custom=False
        )

        custom_type = FertilizerTypes.objects.create(
            id=3,
            name="Custom Blend",
            dryliquid="Dry",
            custom=True
        )

        self.assertEqual(liquid_type.name, "Solution")
        self.assertEqual(liquid_type.dryliquid, "Liquid")
        self.assertFalse(liquid_type.custom)

        self.assertEqual(custom_type.name, "Custom Blend")
        self.assertEqual(custom_type.dryliquid, "Dry")
        self.assertTrue(custom_type.custom)


class FertilizerUnitsTests(TestCase):
    def setUp(self):
        self.fertilizer_unit = FertilizerUnits.objects.create(
            id=1,
            name="lb/acre",
            dryliquid="Dry",
            conversiontoimperialgallonsperacre=0.0,
            farmrequirednutrientsstdunitsconversion=1.0,
            farmrequirednutrientsstdunitsareaconversion=1.0
        )

    def test_fertilizer_unit_creation(self):
        """Test that a fertilizer unit can be created with all required fields"""
        self.assertEqual(self.fertilizer_unit.name, "lb/acre")
        self.assertEqual(self.fertilizer_unit.dryliquid, "Dry")
        self.assertEqual(self.fertilizer_unit.conversiontoimperialgallonsperacre, 0.0)
        self.assertEqual(self.fertilizer_unit.farmrequirednutrientsstdunitsconversion, 1.0)
        self.assertEqual(self.fertilizer_unit.farmrequirednutrientsstdunitsareaconversion, 1.0)

    def test_liquid_fertilizer_unit(self):
        """Test creating a liquid fertilizer unit with conversion factors"""
        liquid_unit = FertilizerUnits.objects.create(
            id=2,
            name="gal/acre",
            dryliquid="Liquid",
            conversiontoimperialgallonsperacre=1.0,
            farmrequirednutrientsstdunitsconversion=8.34,  # lbs per gallon of water
            farmrequirednutrientsstdunitsareaconversion=1.0
        )

        self.assertEqual(liquid_unit.name, "gal/acre")
        self.assertEqual(liquid_unit.dryliquid, "Liquid")
        self.assertEqual(liquid_unit.conversiontoimperialgallonsperacre, 1.0)
        self.assertEqual(liquid_unit.farmrequirednutrientsstdunitsconversion, 8.34)

    def test_metric_fertilizer_unit(self):
        """Test creating metric fertilizer units with conversion factors"""
        metric_unit = FertilizerUnits.objects.create(
            id=3,
            name="kg/ha",
            dryliquid="Dry",
            conversiontoimperialgallonsperacre=0.0,
            farmrequirednutrientsstdunitsconversion=0.893,  # kg/ha to lb/acre conversion
            farmrequirednutrientsstdunitsareaconversion=0.405  # ha to acre conversion
        )

        self.assertEqual(metric_unit.name, "kg/ha")
        self.assertEqual(metric_unit.dryliquid, "Dry")
        self.assertEqual(metric_unit.farmrequirednutrientsstdunitsconversion, 0.893)
        self.assertEqual(metric_unit.farmrequirednutrientsstdunitsareaconversion, 0.405)


class FertilizersTests(TestCase):
    def setUp(self):
        self.fertilizer = Fertilizers.objects.create(
            id=1,
            name="Urea",
            dryliquid="Dry",
            nitrogen=46.0,
            phosphorous=0.0,
            potassium=0.0,
            sortnum=1.0
        )

    def test_fertilizer_creation(self):
        """Test that a fertilizer can be created with all required fields"""
        self.assertEqual(self.fertilizer.name, "Urea")
        self.assertEqual(self.fertilizer.dryliquid, "Dry")
        self.assertEqual(self.fertilizer.nitrogen, 46.0)
        self.assertEqual(self.fertilizer.phosphorous, 0.0)
        self.assertEqual(self.fertilizer.potassium, 0.0)
        self.assertEqual(self.fertilizer.sortnum, 1.0)

    def test_complex_fertilizer(self):
        """Test creating a complex fertilizer with multiple nutrients"""
        npk_fertilizer = Fertilizers.objects.create(
            id=2,
            name="10-10-10",
            dryliquid="Dry",
            nitrogen=10.0,
            phosphorous=10.0,
            potassium=10.0,
            sortnum=2.0
        )

        self.assertEqual(npk_fertilizer.name, "10-10-10")
        self.assertEqual(npk_fertilizer.nitrogen, 10.0)
        self.assertEqual(npk_fertilizer.phosphorous, 10.0)
        self.assertEqual(npk_fertilizer.potassium, 10.0)

    def test_liquid_fertilizer(self):
        """Test creating a liquid fertilizer"""
        liquid_fertilizer = Fertilizers.objects.create(
            id=3,
            name="Liquid N",
            dryliquid="Liquid",
            nitrogen=28.0,
            phosphorous=0.0,
            potassium=0.0,
            sortnum=3.0
        )

        self.assertEqual(liquid_fertilizer.name, "Liquid N")
        self.assertEqual(liquid_fertilizer.dryliquid, "Liquid")
        self.assertEqual(liquid_fertilizer.nitrogen, 28.0)

    def test_fractional_nutrient_values(self):
        """Test that nutrient values can have fractional parts"""
        fractional_fertilizer = Fertilizers.objects.create(
            id=4,
            name="Special Blend",
            dryliquid="Dry",
            nitrogen=12.5,
            phosphorous=6.75,
            potassium=9.25,
            sortnum=4.0
        )

        self.assertEqual(fractional_fertilizer.name, "Special Blend")
        self.assertEqual(fractional_fertilizer.nitrogen, 12.5)
        self.assertEqual(fractional_fertilizer.phosphorous, 6.75)
        self.assertEqual(fractional_fertilizer.potassium, 9.25)

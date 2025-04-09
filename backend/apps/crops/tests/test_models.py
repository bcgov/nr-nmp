from django.db.utils import IntegrityError
from django.test import TestCase

from ..models import (ConversionFactors, Crops, CropSoilPotassiumRegions,
                      CropSoilTestPhosphorousRegions, CropTypes, CropYields,
                      NitrogenRecommendation, PreviousCropTypes,
                      SoilTestMethods, SoilTestPhosphorousKelownaRanges,
                      SoilTestPhosphorousRecommendation,
                      SoilTestPotassiumKelownaRanges,
                      SoilTestPotassiumRecommendation)


class CropTypesTests(TestCase):
    def setUp(self):
        self.crop_type = CropTypes.objects.create(
            id=1,
            name="Test Crop Type",
            covercrop=True,
            crudeproteinrequired=False,
            customcrop=False,
            modifynitrogen=True
        )

    def test_crop_type_creation(self):
        """Test that a crop type can be created with all required fields"""
        self.assertEqual(self.crop_type.name, "Test Crop Type")
        self.assertTrue(self.crop_type.covercrop)
        self.assertFalse(self.crop_type.crudeproteinrequired)
        self.assertFalse(self.crop_type.customcrop)
        self.assertTrue(self.crop_type.modifynitrogen)

    def test_duplicate_id_constraint(self):
        """Test that creating a crop type with a duplicate ID raises an error"""
        with self.assertRaises(IntegrityError):
            CropTypes.objects.create(
                id=1,  # Same ID as in setUp to check the duplicate
                name="Another Crop Type",
                covercrop=False,
                crudeproteinrequired=True,
                customcrop=True,
                modifynitrogen=False
            )


class CropsTests(TestCase):
    def setUp(self):
        self.crop_type = CropTypes.objects.create(
            id=1,
            name="Test Crop Type",
            covercrop=False,
            crudeproteinrequired=False,
            customcrop=False,
            modifynitrogen=False
        )

        self.nitrogen_recommendation = NitrogenRecommendation.objects.create(
            id=1,
            recommendationdesc="Test nitrogen recommendation"
        )

        self.crop = Crops.objects.create(
            id=1,
            cropname="Test Crop",
            croptypeid=self.crop_type.id,
            yieldcd=1.5,
            cropremovalfactornitrogen=0.8,
            cropremovalfactorp2o5=0.6,
            cropremovalfactork2o=0.7,
            nitrogenrecommendationid=self.nitrogen_recommendation.id,
            nitrogenrecommendationpoundperacre=100.0,
            nitrogenrecommendationupperlimitpoundperacre=150.0,
            previouscropcode=1,
            sortnumber=1,
            manureapplicationhistory=1,
            harvestbushelsperton=56.0
        )

    def test_crop_creation(self):
        """Test that a crop can be created with all required fields"""
        self.assertEqual(self.crop.cropname, "Test Crop")
        self.assertEqual(self.crop.croptypeid, self.crop_type.id)
        self.assertEqual(self.crop.yieldcd, 1.5)
        self.assertEqual(self.crop.cropremovalfactornitrogen, 0.8)
        self.assertEqual(self.crop.cropremovalfactorp2o5, 0.6)
        self.assertEqual(self.crop.cropremovalfactork2o, 0.7)
        self.assertEqual(self.crop.nitrogenrecommendationid, self.nitrogen_recommendation.id)
        self.assertEqual(self.crop.nitrogenrecommendationpoundperacre, 100.0)
        self.assertEqual(self.crop.nitrogenrecommendationupperlimitpoundperacre, 150.0)
        self.assertEqual(self.crop.previouscropcode, 1)
        self.assertEqual(self.crop.sortnumber, 1)
        self.assertEqual(self.crop.manureapplicationhistory, 1)
        self.assertEqual(self.crop.harvestbushelsperton, 56.0)

    def test_crop_optional_fields(self):
        """Test that optional fields can be null"""
        crop_without_optional = Crops.objects.create(
            id=2,
            cropname="Test Crop 2",
            croptypeid=self.crop_type.id,
            yieldcd=1.5,
            cropremovalfactornitrogen=0.8,
            cropremovalfactorp2o5=0.6,
            cropremovalfactork2o=0.7,
            nitrogenrecommendationid=self.nitrogen_recommendation.id,
            previouscropcode=1,
            sortnumber=1,
            manureapplicationhistory=1
        )

        self.assertIsNone(crop_without_optional.nitrogenrecommendationpoundperacre)
        self.assertIsNone(crop_without_optional.nitrogenrecommendationupperlimitpoundperacre)
        self.assertIsNone(crop_without_optional.harvestbushelsperton)

    def test_crop_relationships(self):
        """Test the relationship between crops and crop types"""
        # Verify the crop type exists
        crop_type = CropTypes.objects.get(id=self.crop.croptypeid)
        self.assertEqual(crop_type.name, "Test Crop Type")

        # Verify the nitrogen recommendation exists
        nitrogen_rec = NitrogenRecommendation.objects.get(id=self.crop.nitrogenrecommendationid)
        self.assertEqual(nitrogen_rec.recommendationdesc, "Test nitrogen recommendation")


class PreviousCropTypesTests(TestCase):
    def setUp(self):
        self.crop_type = CropTypes.objects.create(
            id=1,
            name="Test Crop Type",
            covercrop=False,
            crudeproteinrequired=False,
            customcrop=False,
            modifynitrogen=False
        )

        self.crop = Crops.objects.create(
            id=1,
            cropname="Test Crop",
            croptypeid=self.crop_type.id,
            yieldcd=1.5,
            cropremovalfactornitrogen=0.8,
            cropremovalfactorp2o5=0.6,
            cropremovalfactork2o=0.7,
            nitrogenrecommendationid=1,
            previouscropcode=1,
            sortnumber=1,
            manureapplicationhistory=1
        )

        self.previous_crop = PreviousCropTypes.objects.create(
            id=1,
            previouscropcode=1,
            name="Test Previous Crop",
            nitrogencreditmetric=50,
            nitrogencreditimperial=45,
            cropid=self.crop.id,
            croptypeid=self.crop_type.id
        )

    def test_previous_crop_creation(self):
        """Test that a previous crop type can be created with all required fields"""
        self.assertEqual(self.previous_crop.previouscropcode, 1)
        self.assertEqual(self.previous_crop.name, "Test Previous Crop")
        self.assertEqual(self.previous_crop.nitrogencreditmetric, 50)
        self.assertEqual(self.previous_crop.nitrogencreditimperial, 45)
        self.assertEqual(self.previous_crop.cropid, self.crop.id)
        self.assertEqual(self.previous_crop.croptypeid, self.crop_type.id)

    def test_previous_crop_optional_croptypeid(self):
        """Test that croptypeid can be null"""
        previous_crop_without_type = PreviousCropTypes.objects.create(
            id=2,
            previouscropcode=2,
            name="Test Previous Crop 2",
            nitrogencreditmetric=50,
            nitrogencreditimperial=45,
            cropid=self.crop.id
        )
        self.assertIsNone(previous_crop_without_type.croptypeid)

    def test_previous_crop_relationships(self):
        """Test the relationship between previous crop types and crops/crop types"""
        # Verify the crop exists
        crop = Crops.objects.get(id=self.previous_crop.cropid)
        self.assertEqual(crop.cropname, "Test Crop")

        # Verify the crop type exists
        crop_type = CropTypes.objects.get(id=self.previous_crop.croptypeid)
        self.assertEqual(crop_type.name, "Test Crop Type")


class SoilTestMethodsTests(TestCase):
    def setUp(self):
        self.soil_test_method = SoilTestMethods.objects.create(
            id=1,
            name="Test Soil Method",
            converttokelownaphlessthan72=1.2,
            converttokelownaphgreaterthan72=1.1,
            converttokelownak=1.3,
            sortnum=1
        )

    def test_soil_test_method_creation(self):
        """Test that a soil test method can be created with all required fields"""
        self.assertEqual(self.soil_test_method.name, "Test Soil Method")
        self.assertEqual(self.soil_test_method.converttokelownaphlessthan72, 1.2)
        self.assertEqual(self.soil_test_method.converttokelownaphgreaterthan72, 1.1)
        self.assertEqual(self.soil_test_method.converttokelownak, 1.3)
        self.assertEqual(self.soil_test_method.sortnum, 1)

    def test_negative_conversion_factors(self):
        """Test that negative conversion factors are allowed"""
        soil_test_method = SoilTestMethods.objects.create(
            id=2,
            name="Negative Factors Method",
            converttokelownaphlessthan72=-0.5,
            converttokelownaphgreaterthan72=-0.7,
            converttokelownak=-0.9,
            sortnum=2
        )

        self.assertEqual(soil_test_method.converttokelownaphlessthan72, -0.5)
        self.assertEqual(soil_test_method.converttokelownaphgreaterthan72, -0.7)
        self.assertEqual(soil_test_method.converttokelownak, -0.9)


class ConversionFactorsTests(TestCase):
    def setUp(self):
        self.conversion_factors = ConversionFactors.objects.create(
            id=1,
            nitrogenproteinconversion=6.25,
            unitconversion=2.2,
            defaultsoiltestkelownaphosphorous=30.0,
            defaultsoiltestkelownapotassium=200.0,
            kilogramperhectaretopoundperacreconversion=0.893,
            potassiumavailabilityfirstyear=0.9,
            potassiumavailabilitylongterm=0.75,
            potassiumktok2oconversion=1.2,
            phosphorousavailabilityfirstyear=0.7,
            phosphorousavailabilitylongterm=0.5,
            phosphorousptop2o5conversion=2.29,
            poundpertonconversion=2000.0,
            poundper1000ftsquaredtopoundperacreconversion=43.56,
            defaultapplicationofmanureinprevyears=3.0,
            soiltestppmtopoundperacreconversion=2.0
        )

    def test_conversion_factors_creation(self):
        """Test that conversion factors can be created with all required fields"""
        self.assertEqual(self.conversion_factors.nitrogenproteinconversion, 6.25)
        self.assertEqual(self.conversion_factors.unitconversion, 2.2)
        self.assertEqual(self.conversion_factors.defaultsoiltestkelownaphosphorous, 30.0)
        self.assertEqual(self.conversion_factors.defaultsoiltestkelownapotassium, 200.0)
        self.assertEqual(self.conversion_factors.kilogramperhectaretopoundperacreconversion, 0.893)
        self.assertEqual(self.conversion_factors.potassiumavailabilityfirstyear, 0.9)
        self.assertEqual(self.conversion_factors.potassiumavailabilitylongterm, 0.75)
        self.assertEqual(self.conversion_factors.potassiumktok2oconversion, 1.2)
        self.assertEqual(self.conversion_factors.phosphorousavailabilityfirstyear, 0.7)
        self.assertEqual(self.conversion_factors.phosphorousavailabilitylongterm, 0.5)
        self.assertEqual(self.conversion_factors.phosphorousptop2o5conversion, 2.29)
        self.assertEqual(self.conversion_factors.poundpertonconversion, 2000.0)
        self.assertEqual(self.conversion_factors.poundper1000ftsquaredtopoundperacreconversion, 43.56)
        self.assertEqual(self.conversion_factors.defaultapplicationofmanureinprevyears, 3.0)
        self.assertEqual(self.conversion_factors.soiltestppmtopoundperacreconversion, 2.0)


class NitrogenRecommendationTests(TestCase):
    def setUp(self):
        self.recommendation = NitrogenRecommendation.objects.create(
            id=1,
            recommendationdesc="Test recommendation description"
        )

    def test_recommendation_creation(self):
        """Test that a nitrogen recommendation can be created"""
        self.assertEqual(self.recommendation.recommendationdesc, "Test recommendation description")

    def test_long_description(self):
        """Test that a long description can be stored"""
        long_desc = "This is a very long description " * 50  # Create a long text
        recommendation = NitrogenRecommendation.objects.create(
            id=2,
            recommendationdesc=long_desc
        )
        self.assertEqual(recommendation.recommendationdesc, long_desc)


class CropYieldsTests(TestCase):
    def setUp(self):
        self.crop_type = CropTypes.objects.create(
            id=1,
            name="Test Crop Type",
            covercrop=False,
            crudeproteinrequired=False,
            customcrop=False,
            modifynitrogen=False
        )

        self.crop = Crops.objects.create(
            id=1,
            cropname="Test Crop",
            croptypeid=self.crop_type.id,
            yieldcd=1.5,
            cropremovalfactornitrogen=0.8,
            cropremovalfactorp2o5=0.6,
            cropremovalfactork2o=0.7,
            nitrogenrecommendationid=1,
            previouscropcode=1,
            sortnumber=1,
            manureapplicationhistory=1
        )

        self.crop_yield = CropYields.objects.create(
            id=1,
            cropid=self.crop.id,
            locationid=1,
            amount=2.5
        )

    def test_crop_yield_creation(self):
        """Test that a crop yield can be created with all required fields"""
        self.assertEqual(self.crop_yield.cropid, self.crop.id)
        self.assertEqual(self.crop_yield.locationid, 1)
        self.assertEqual(self.crop_yield.amount, 2.5)

    def test_crop_yield_optional_amount(self):
        """Test that amount can be null"""
        crop_yield_without_amount = CropYields.objects.create(
            id=2,
            cropid=self.crop.id,
            locationid=2
        )
        self.assertIsNone(crop_yield_without_amount.amount)

    def test_crop_yield_relationship(self):
        """Test the relationship between crop yields and crops"""
        crop = Crops.objects.get(id=self.crop_yield.cropid)
        self.assertEqual(crop.cropname, "Test Crop")


class SoilTestPhosphorousKelownaRangesTests(TestCase):
    def setUp(self):
        self.range = SoilTestPhosphorousKelownaRanges.objects.create(
            id=1,
            rangelow=10,
            rangehigh=20
        )

    def test_soil_test_phosphorous_range_creation(self):
        """Test that a soil test phosphorous range can be created"""
        self.assertEqual(self.range.rangelow, 10)
        self.assertEqual(self.range.rangehigh, 20)

    def test_overlapping_ranges(self):
        """Test that overlapping ranges can be created (no constraint in model)"""
        overlapping_range = SoilTestPhosphorousKelownaRanges.objects.create(
            id=2,
            rangelow=15,
            rangehigh=25
        )
        self.assertEqual(overlapping_range.rangelow, 15)
        self.assertEqual(overlapping_range.rangehigh, 25)


class SoilTestPotassiumKelownaRangesTests(TestCase):
    def setUp(self):
        self.range = SoilTestPotassiumKelownaRanges.objects.create(
            id=1,
            rangelow=100,
            rangehigh=200
        )

    def test_soil_test_potassium_range_creation(self):
        """Test that a soil test potassium range can be created"""
        self.assertEqual(self.range.rangelow, 100)
        self.assertEqual(self.range.rangehigh, 200)

    def test_duplicated_id(self):
        """Test that creating a range with a duplicate ID raises an error"""
        with self.assertRaises(IntegrityError):
            SoilTestPotassiumKelownaRanges.objects.create(
                id=1,  # Same ID as in setUp
                rangelow=300,
                rangehigh=400
            )


class CropSoilTestPhosphorousRegionsTests(TestCase):
    def setUp(self):
        self.crop_type = CropTypes.objects.create(
            id=1,
            name="Test Crop Type",
            covercrop=False,
            crudeproteinrequired=False,
            customcrop=False,
            modifynitrogen=False
        )

        self.crop = Crops.objects.create(
            id=1,
            cropname="Test Crop",
            croptypeid=self.crop_type.id,
            yieldcd=1.5,
            cropremovalfactornitrogen=0.8,
            cropremovalfactorp2o5=0.6,
            cropremovalfactork2o=0.7,
            nitrogenrecommendationid=1,
            previouscropcode=1,
            sortnumber=1,
            manureapplicationhistory=1
        )

        self.phosphorous_region = CropSoilTestPhosphorousRegions.objects.create(
            id=1,
            cropid=self.crop.id,
            soiltestphosphorousregioncode=1,
            phosphorouscropgroupregioncode=2
        )

    def test_phosphorous_region_creation(self):
        """Test that a phosphorous region can be created"""
        self.assertEqual(self.phosphorous_region.cropid, self.crop.id)
        self.assertEqual(self.phosphorous_region.soiltestphosphorousregioncode, 1)
        self.assertEqual(self.phosphorous_region.phosphorouscropgroupregioncode, 2)

    def test_phosphorous_region_relationship(self):
        """Test the relationship between phosphorous regions and crops"""
        crop = Crops.objects.get(id=self.phosphorous_region.cropid)
        self.assertEqual(crop.cropname, "Test Crop")


class SoilTestPhosphorousRecommendationTests(TestCase):
    def setUp(self):
        self.range = SoilTestPhosphorousKelownaRanges.objects.create(
            id=1,
            rangelow=10,
            rangehigh=20
        )

        self.recommendation = SoilTestPhosphorousRecommendation.objects.create(
            id=1,
            soiltestphosphorouskelownarangeid=self.range.id,
            soiltestphosphorousregioncode=1.0,
            phosphorouscropgroupregioncode=2.0,
            p2o5recommendationkilogramperhectare=60.0
        )

    def test_phosphorous_recommendation_creation(self):
        """Test that a phosphorous recommendation can be created"""
        self.assertEqual(self.recommendation.soiltestphosphorouskelownarangeid, self.range.id)
        self.assertEqual(self.recommendation.soiltestphosphorousregioncode, 1.0)
        self.assertEqual(self.recommendation.phosphorouscropgroupregioncode, 2.0)
        self.assertEqual(self.recommendation.p2o5recommendationkilogramperhectare, 60.0)

    def test_phosphorous_recommendation_relationship(self):
        """Test the relationship between phosphorous recommendations and kelowna ranges"""
        kelowna_range = SoilTestPhosphorousKelownaRanges.objects.get(id=self.recommendation.soiltestphosphorouskelownarangeid)
        self.assertEqual(kelowna_range.rangelow, 10)
        self.assertEqual(kelowna_range.rangehigh, 20)


class SoilTestPotassiumRecommendationTests(TestCase):
    def setUp(self):
        self.range = SoilTestPotassiumKelownaRanges.objects.create(
            id=1,
            rangelow=100,
            rangehigh=200
        )

        self.recommendation = SoilTestPotassiumRecommendation.objects.create(
            id=1,
            soiltestpotassiumkelownarangeid=self.range.id,
            soiltestpotassiumregioncode=1.0,
            potassiumcropgroupregioncode=2.0,
            k2orecommendationkilogramperhectare=80.0
        )

    def test_potassium_recommendation_creation(self):
        """Test that a potassium recommendation can be created"""
        self.assertEqual(self.recommendation.soiltestpotassiumkelownarangeid, self.range.id)
        self.assertEqual(self.recommendation.soiltestpotassiumregioncode, 1.0)
        self.assertEqual(self.recommendation.potassiumcropgroupregioncode, 2.0)
        self.assertEqual(self.recommendation.k2orecommendationkilogramperhectare, 80.0)

    def test_potassium_recommendation_relationship(self):
        """Test the relationship between potassium recommendations and kelowna ranges"""
        kelowna_range = SoilTestPotassiumKelownaRanges.objects.get(id=self.recommendation.soiltestpotassiumkelownarangeid)
        self.assertEqual(kelowna_range.rangelow, 100)
        self.assertEqual(kelowna_range.rangehigh, 200)


class CropSoilPotassiumRegionsTests(TestCase):
    def setUp(self):
        self.crop_type = CropTypes.objects.create(
            id=1,
            name="Test Crop Type",
            covercrop=False,
            crudeproteinrequired=False,
            customcrop=False,
            modifynitrogen=False
        )

        self.crop = Crops.objects.create(
            id=1,
            cropname="Test Crop",
            croptypeid=self.crop_type.id,
            yieldcd=1.5,
            cropremovalfactornitrogen=0.8,
            cropremovalfactorp2o5=0.6,
            cropremovalfactork2o=0.7,
            nitrogenrecommendationid=1,
            previouscropcode=1,
            sortnumber=1,
            manureapplicationhistory=1
        )

        self.potassium_region = CropSoilPotassiumRegions.objects.create(
            id=1,
            cropid=self.crop.id,
            soiltestpotassiumregioncode=1,
            potassiumcropgroupregioncode=2
        )

    def test_potassium_region_creation(self):
        """Test that a potassium region can be created"""
        self.assertEqual(self.potassium_region.cropid, self.crop.id)
        self.assertEqual(self.potassium_region.soiltestpotassiumregioncode, 1)
        self.assertEqual(self.potassium_region.potassiumcropgroupregioncode, 2)

    def test_potassium_region_relationship(self):
        """Test the relationship between potassium regions and crops"""
        crop = Crops.objects.get(id=self.potassium_region.cropid)
        self.assertEqual(crop.cropname, "Test Crop")

from django.db.utils import IntegrityError
from django.test import TestCase

from ..models import Animals, AnimalSubtype, Breed


class AnimalsTests(TestCase):
    def setUp(self):
        self.animal = Animals.objects.create(
            id=1,
            name="Cattle",
            usesortorder=True
        )

    def test_animal_creation(self):
        """Test that an animal can be created with all required fields"""
        self.assertEqual(self.animal.name, "Cattle")
        self.assertTrue(self.animal.usesortorder)

    def test_duplicate_id_constraint(self):
        """Test that creating an animal with a duplicate ID raises an error"""
        with self.assertRaises(IntegrityError):
            Animals.objects.create(
                id=1,  # Same ID as in setUp which should cause the error
                name="Sheep",
                usesortorder=False
            )

    def test_multiple_animals(self):
        """Test creating multiple animal types"""
        sheep = Animals.objects.create(
            id=2,
            name="Sheep",
            usesortorder=True
        )

        poultry = Animals.objects.create(
            id=3,
            name="Poultry",
            usesortorder=False
        )

        self.assertEqual(sheep.name, "Sheep")
        self.assertTrue(sheep.usesortorder)

        self.assertEqual(poultry.name, "Poultry")
        self.assertFalse(poultry.usesortorder)


class AnimalSubtypeTests(TestCase):
    def setUp(self):
        self.animal = Animals.objects.create(
            id=1,
            name="Cattle",
            usesortorder=True
        )

        self.subtype = AnimalSubtype.objects.create(
            id=1,
            name="Dairy",
            liquidpergalperanimalperday=15.0,
            solidpergalperanimalperday=7.5,
            solidperpoundperanimalperday=62.5,
            solidliquidseparationpercentage=30,
            washwater=5.0,
            milkproduction=80.0,
            animalid=self.animal.id,
            sortorder=1
        )

    def test_subtype_creation(self):
        """Test that an animal subtype can be created with all required fields"""
        self.assertEqual(self.subtype.name, "Dairy")
        self.assertEqual(self.subtype.liquidpergalperanimalperday, 15.0)
        self.assertEqual(self.subtype.solidpergalperanimalperday, 7.5)
        self.assertEqual(self.subtype.solidperpoundperanimalperday, 62.5)
        self.assertEqual(self.subtype.solidliquidseparationpercentage, 30)
        self.assertEqual(self.subtype.washwater, 5.0)
        self.assertEqual(self.subtype.milkproduction, 80.0)
        self.assertEqual(self.subtype.animalid, self.animal.id)
        self.assertEqual(self.subtype.sortorder, 1)

    def test_subtype_relationship(self):
        """Test relationship between animal subtype and animal"""
        animal = Animals.objects.get(id=self.subtype.animalid)
        self.assertEqual(animal.name, "Cattle")

    def test_multiple_subtypes(self):
        """Test creating multiple subtypes for the same animal"""
        beef = AnimalSubtype.objects.create(
            id=2,
            name="Beef",
            liquidpergalperanimalperday=10.0,
            solidpergalperanimalperday=5.0,
            solidperpoundperanimalperday=41.7,
            solidliquidseparationpercentage=25,
            washwater=2.0,
            milkproduction=0.0,
            animalid=self.animal.id,
            sortorder=2
        )

        # Check that we created the animal
        self.assertEqual(beef.name, "Beef")
        self.assertEqual(beef.animalid, self.animal.id)

        # Verify both subtypes are associated with the same animal
        subtypes = AnimalSubtype.objects.filter(animalid=self.animal.id).count()
        self.assertEqual(subtypes, 2)


class BreedTests(TestCase):
    def setUp(self):
        self.animal = Animals.objects.create(
            id=1,
            name="Cattle",
            usesortorder=True
        )

        self.breed = Breed.objects.create(
            id=1,
            breedname="Holstein",
            animalid=self.animal.id,
            breedmanurefactor=1.0
        )

    def test_breed_creation(self):
        """Test that a breed can be created with all required fields"""
        self.assertEqual(self.breed.breedname, "Holstein")
        self.assertEqual(self.breed.animalid, self.animal.id)
        self.assertEqual(self.breed.breedmanurefactor, 1.0)

    def test_breed_relationship(self):
        """Test relationship between breed and animal"""
        animal = Animals.objects.get(id=self.breed.animalid)
        self.assertEqual(animal.name, "Cattle")

    def test_multiple_breeds(self):
        """Test creating multiple breeds for the same animal"""
        jersey = Breed.objects.create(
            id=2,
            breedname="Jersey",
            animalid=self.animal.id,
            breedmanurefactor=0.8
        )

        angus = Breed.objects.create(
            id=3,
            breedname="Angus",
            animalid=self.animal.id,
            breedmanurefactor=0.9
        )

        # Create the breeds
        self.assertEqual(jersey.breedname, "Jersey")
        self.assertEqual(jersey.breedmanurefactor, 0.8)

        self.assertEqual(angus.breedname, "Angus")
        self.assertEqual(angus.breedmanurefactor, 0.9)

        # Verify all breeds are associated with the same animal
        breeds = Breed.objects.filter(animalid=self.animal.id).count()
        self.assertEqual(breeds, 3)

    def test_different_manure_factors(self):
        """Test that different breeds can have different manure factors"""
        small_factor = Breed.objects.create(
            id=4,
            breedname="Small Breed",
            animalid=self.animal.id,
            breedmanurefactor=0.6
        )

        large_factor = Breed.objects.create(
            id=5,
            breedname="Large Breed",
            animalid=self.animal.id,
            breedmanurefactor=1.2
        )

        self.assertEqual(small_factor.breedmanurefactor, 0.6)
        self.assertEqual(large_factor.breedmanurefactor, 1.2)

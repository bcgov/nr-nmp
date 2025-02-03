from django.db import models

class Animals(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=100)
    usesortorder = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'animals'

class AnimalSubtype(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=100)
    liquidpergalperanimalperday = models.FloatField()
    solidpergalperanimalperday = models.FloatField()
    solidperpoundperanimalperday = models.FloatField()
    solidliquidseparationpercentage = models.IntegerField()
    washwater = models.FloatField()
    milkproduction = models.FloatField()
    animalid = models.IntegerField()
    sortorder = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'animal_subtype'

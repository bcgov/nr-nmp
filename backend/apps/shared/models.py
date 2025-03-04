from django.db import models

class Regions(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=100)
    soiltestphosphorousregioncd = models.IntegerField()
    soiltestpotassiumregioncd = models.IntegerField()
    locationid = models.IntegerField()
    sortorder = models.IntegerField()

    class Meta:
        managed = True
        db_table = 'regions'

class Subregion(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=100)
    annualprecipitation = models.IntegerField()
    annualprecipitationocttomar = models.IntegerField()
    regionid = models.IntegerField()

    class Meta:
        managed = True
        db_table = 'subregion'

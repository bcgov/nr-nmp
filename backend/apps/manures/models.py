from django.db import models

class Manures(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=100)
    manureclass = models.CharField(max_length=100)
    solidliquid = models.CharField(max_length=100)
    moisture = models.CharField(max_length=100)
    nitrogen = models.FloatField()
    ammonia = models.FloatField()
    phosphorous = models.FloatField()
    potassium = models.FloatField()
    drymatterid = models.IntegerField()
    nmineralizationid = models.IntegerField()
    sortnum = models.IntegerField()
    cubicyardconversion = models.FloatField()
    nitrate = models.FloatField()
    defaultsolidmoisture = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'manures'
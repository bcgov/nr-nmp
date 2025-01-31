from django.db import models

class Fertilizers(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=100)
    dryliquid = models.CharField(max_length=100)
    nitrogen = models.models.IntegerField() 
    phosphorous = models.models.IntegerField() 
    potassium = models.models.IntegerField() 
    sortnum = models.models.IntegerField() 

    class Meta:
        managed = False
        db_table = 'fertilizers'

from django.db import models

class Animals(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=100)
    usesortorder = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'animals'
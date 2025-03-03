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

# New model that will be managed by Django ORM
class Note(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title

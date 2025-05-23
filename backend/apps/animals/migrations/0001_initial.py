# Generated by Django 5.1.7 on 2025-03-20 18:43

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Animals',
            fields=[
                ('id', models.IntegerField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100)),
                ('usesortorder', models.BooleanField()),
            ],
            options={
                'db_table': 'animals',
                'managed': True,
            },
        ),
        migrations.CreateModel(
            name='AnimalSubtype',
            fields=[
                ('id', models.IntegerField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100)),
                ('liquidpergalperanimalperday', models.FloatField()),
                ('solidpergalperanimalperday', models.FloatField()),
                ('solidperpoundperanimalperday', models.FloatField()),
                ('solidliquidseparationpercentage', models.IntegerField()),
                ('washwater', models.FloatField()),
                ('milkproduction', models.FloatField()),
                ('animalid', models.IntegerField()),
                ('sortorder', models.IntegerField()),
            ],
            options={
                'db_table': 'animal_subtype',
                'managed': True,
            },
        ),
        migrations.CreateModel(
            name='Breed',
            fields=[
                ('id', models.IntegerField(primary_key=True, serialize=False)),
                ('breedname', models.CharField(max_length=100)),
                ('animalid', models.IntegerField()),
                ('breedmanurefactor', models.FloatField()),
            ],
            options={
                'db_table': 'breed',
                'managed': True,
            },
        ),
    ]

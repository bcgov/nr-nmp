from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='CropTypes',
            fields=[
                ('id', models.IntegerField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100)),
                ('covercrop', models.BooleanField()),
                ('crudeproteinrequired', models.BooleanField()),
                ('customcrop', models.BooleanField()),
                ('modifynitrogen', models.BooleanField()),
            ],
            options={
                'db_table': 'crop_types',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='Crops',
            fields=[
                ('id', models.IntegerField(primary_key=True, serialize=False)),
                ('cropname', models.CharField(max_length=100)),
                ('croptypeid', models.IntegerField()),
                ('yieldcd', models.FloatField()),
                ('cropremovalfactornitrogen', models.FloatField()),
                ('cropremovalfactorp2o5', models.FloatField()),
                ('cropremovalfactork2o', models.FloatField()),
                ('nitrogenrecommendationid', models.IntegerField()),
                ('nitrogenrecommendationpoundperacre', models.FloatField(blank=True, null=True)),
                ('nitrogenrecommendationupperlimitpoundperacre', models.FloatField(blank=True, null=True)),
                ('previouscropcode', models.IntegerField()),
                ('sortnumber', models.IntegerField()),
                ('manureapplicationhistory', models.IntegerField()),
                ('harvestbushelsperton', models.FloatField(blank=True, null=True)),
            ],
            options={
                'db_table': 'crops',
                'managed': False,
            },
        ),
    ] 
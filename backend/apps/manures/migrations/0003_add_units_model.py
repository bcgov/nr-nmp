# Generated manually to add the Units model

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('manures', '0002_allow_null_defaultsolidmoisture'),
    ]

    operations = [
        migrations.CreateModel(
            name='Units',
            fields=[
                ('id', models.IntegerField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100)),
                ('nutrientcontentunits', models.CharField()),
                ('conversionlbton', models.FloatField()),
                ('nutrientrateunits', models.CharField(max_length=100)),
                ('costunits', models.CharField(max_length=100)),
                ('costapplications', models.CharField(max_length=100)),
                ('dollarunitarea', models.CharField(max_length=100)),
                ('valuematerialunits', models.CharField(max_length=100)),
                ('valuen', models.CharField(max_length=100)),
                ('valuep2o5', models.CharField(max_length=100)),
                ('valuek2o', models.CharField(max_length=100)),
                ('farmreqdnutrientsstdunitsconversion', models.FloatField()),
                ('farmreqdnutrientsstdunitsareaconversion', models.FloatField()),
                ('solidliquid', models.CharField(max_length=100)),
            ],
            options={
                'db_table': 'units',
                'managed': True,
            },
        ),
    ]

# Generated by Django 5.1.7 on 2025-03-20 18:43

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Regions',
            fields=[
                ('id', models.IntegerField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100)),
                ('soiltestphosphorousregioncd', models.IntegerField()),
                ('soiltestpotassiumregioncd', models.IntegerField()),
                ('locationid', models.IntegerField()),
                ('sortorder', models.IntegerField()),
            ],
            options={
                'db_table': 'regions',
                'managed': True,
            },
        ),
        migrations.CreateModel(
            name='Subregion',
            fields=[
                ('id', models.IntegerField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100)),
                ('annualprecipitation', models.IntegerField()),
                ('annualprecipitationocttomar', models.IntegerField()),
                ('regionid', models.IntegerField()),
            ],
            options={
                'db_table': 'subregion',
                'managed': True,
            },
        ),
    ]

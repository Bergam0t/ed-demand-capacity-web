# Generated by Django 3.2.3 on 2021-07-27 18:03

import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0016_alter_scenario_start_date'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='additionalfactoravailablecapacity',
            name='all_streams',
        ),
        migrations.RemoveField(
            model_name='additionalfactoravailablecapacity',
            name='stream',
        ),
        migrations.RemoveField(
            model_name='additionalfactorrequiredcapacity',
            name='all_streams',
        ),
        migrations.RemoveField(
            model_name='additionalfactorrequiredcapacity',
            name='stream',
        ),
        migrations.AddField(
            model_name='additionalfactoravailablecapacity',
            name='streams',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.CharField(blank=True, max_length=150, null=True), null=True, size=None),
        ),
        migrations.AddField(
            model_name='additionalfactorrequiredcapacity',
            name='streams',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.CharField(blank=True, max_length=150, null=True), null=True, size=None),
        ),
    ]
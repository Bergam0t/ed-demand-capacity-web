# Generated by Django 3.2.3 on 2021-07-27 15:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0014_scenario_user_session'),
    ]

    operations = [
        migrations.AlterField(
            model_name='scenario',
            name='start_date',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
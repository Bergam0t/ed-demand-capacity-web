# Generated by Django 3.2.3 on 2021-07-21 17:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='notes',
            name='notes',
            field=models.TextField(default=''),
        ),
    ]

# Generated by Django 3.2.3 on 2021-06-29 12:17

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_shift_shiftbreak'),
    ]

    operations = [
        migrations.CreateModel(
            name='Notes',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user_session', models.CharField(default='Not recorded', max_length=50)),
                ('notes', models.TextField()),
            ],
        ),
    ]

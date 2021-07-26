# Generated by Django 3.2.3 on 2021-07-24 13:34

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_historicdata_processing_initialised_at'),
    ]

    operations = [
        migrations.CreateModel(
            name='RotaEntry',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user_session', models.CharField(default='Not recorded', max_length=50)),
                ('resource_name', models.CharField(default='', max_length=150)),
                ('week_start', models.DateField(blank=True, null=True)),
                ('week_end', models.DateField(blank=True, null=True)),
                ('resource_type', models.CharField(choices=[('core', 'Core'), ('adhoc', 'Ad-hoc')], default='core', max_length=10)),
                ('friday', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='friday', to='api.shift')),
                ('monday', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='monday', to='api.shift')),
                ('role_type', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.role')),
                ('saturday', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='saturday', to='api.shift')),
                ('sunday', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sunday', to='api.shift')),
                ('thursday', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='thursday', to='api.shift')),
                ('tuesday', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tuesday', to='api.shift')),
                ('wednesday', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='wednesday', to='api.shift')),
            ],
        ),
    ]
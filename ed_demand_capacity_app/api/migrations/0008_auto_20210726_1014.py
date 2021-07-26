# Generated by Django 3.2.3 on 2021-07-26 09:14

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_auto_20210726_0953'),
    ]

    operations = [
        migrations.AlterField(
            model_name='rotaentry',
            name='friday',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='friday', to='api.shift'),
        ),
        migrations.AlterField(
            model_name='rotaentry',
            name='monday',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='monday', to='api.shift'),
        ),
        migrations.AlterField(
            model_name='rotaentry',
            name='saturday',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='saturday', to='api.shift'),
        ),
        migrations.AlterField(
            model_name='rotaentry',
            name='sunday',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='sunday', to='api.shift'),
        ),
        migrations.AlterField(
            model_name='rotaentry',
            name='thursday',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='thursday', to='api.shift'),
        ),
        migrations.AlterField(
            model_name='rotaentry',
            name='tuesday',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='tuesday', to='api.shift'),
        ),
        migrations.AlterField(
            model_name='rotaentry',
            name='wednesday',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='wednesday', to='api.shift'),
        ),
    ]

# Generated by Django 3.0.3 on 2021-01-20 21:18

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0085_salesevidence'),
    ]

    operations = [
        migrations.AlterModelTable(
            name='salesevidence',
            table='sales_submission_evidence',
        ),
    ]
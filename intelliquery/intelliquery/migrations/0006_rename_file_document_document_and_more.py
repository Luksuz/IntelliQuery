# Generated by Django 5.1.1 on 2024-09-08 14:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('intelliquery', '0005_alter_webapp_user_document'),
    ]

    operations = [
        migrations.RenameField(
            model_name='document',
            old_name='file',
            new_name='document',
        ),
        migrations.RenameField(
            model_name='document',
            old_name='Webapp',
            new_name='webapp',
        ),
        migrations.AddIndex(
            model_name='document',
            index=models.Index(fields=['webapp'], name='intelliquer_webapp__026a35_idx'),
        ),
    ]

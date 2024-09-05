# models.py - Define your models here

from django.db import models
from django.contrib.auth.models import User

class Website(models.Model):
    user = models.ForeignKey(User, related_name='websites', on_delete=models.CASCADE)
    url = models.URLField(max_length=100)
    name = models.CharField(max_length=30)

    def __str__(self):
        return self.name
    
    class Meta:
        indexes = [
            models.Index(fields=['user']),  # This creates an index on the user_id field
        ]
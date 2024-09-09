from django.db import models
from django.contrib.auth.models import User

class Webapp(models.Model):
    user = models.ForeignKey(User, related_name='webapps', on_delete=models.CASCADE)
    description = models.CharField(max_length=500)
    template = models.CharField(max_length=10, default="index")
    url = models.URLField(max_length=100, unique=True)  # Ensure URL uniqueness is what you need
    timestamp = models.DateTimeField(auto_now_add=True) 
    docs = models.FileField(upload_to='pdfs/', blank=True, null=True)

    def __str__(self):
        return self.description
    
    class Meta:
        indexes = [
            models.Index(fields=['user']),
        ]


class Document(models.Model):
    webapp = models.ForeignKey(Webapp, related_name="documents", on_delete=models.CASCADE)
    document = models.FileField(upload_to='documents/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return str(self.document)
    
    class Meta:
        indexes = [
            models.Index(fields=['webapp']),
        ]


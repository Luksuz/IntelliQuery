# serializers.py - Define your serializers here

from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Webapp, Document


class WebappSerializer(serializers.ModelSerializer):
    class Meta:
        model = Webapp
        fields = ['id', 'url', 'description', 'timestamp' ]

    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user
        website = Webapp.objects.create(user=user, **validated_data)
        return website
    
class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document  # Use the Document model
        fields = ['id', 'document', 'uploaded_at']  # Include necessary fields

    def create(self, validated_data):
        return Document.objects.create(**validated_data)


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email'),
            password=validated_data['password']
        )
        return user
    

class RAGRequestSerializer(serializers.Serializer):
    description = serializers.CharField(max_length=200, required=True)
    template = serializers.CharField(max_length=10, required=True)
    documents = serializers.ListField(
    child=serializers.FileField(),
    required=True
    )

    def validate_document(self, value):
        if value.size > 2 * 1024 * 1024:
            raise serializers.ValidationError("File too large. Maximum size allowed is 2 MB.")
        return value

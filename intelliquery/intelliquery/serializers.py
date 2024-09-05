# serializers.py - Define your serializers here

from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Website


class WebsiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Website
        fields = ['id', 'url', 'name']

    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user
        website = Website.objects.create(user=user, **validated_data)
        return website

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
        # Validate the uploaded document, e.g., check file size or type
        if value.size > 2 * 1024 * 1024:  # limit file size to 2 MB
            raise serializers.ValidationError("File too large. Maximum size allowed is 2 MB.")
        return value

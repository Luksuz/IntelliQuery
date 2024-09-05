# views.py - Define your API views here

from rest_framework import generics, viewsets, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response  # Import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from django.contrib.auth.models import User
from .models import Website
from .serializers import UserSerializer, WebsiteSerializer, RAGRequestSerializer
from rest_framework.exceptions import NotAuthenticated
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from .service.process_rag import process_rag
from rest_framework.parsers import MultiPartParser, FormParser
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi



class RegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]  # Allow anyone to register (no authentication required)
    queryset = User.objects.all()
    serializer_class = UserSerializer


class WebsiteViewSet(viewsets.ModelViewSet):
    serializer_class = WebsiteSerializer

    def get_queryset(self):
        # Skip authentication check if swagger is generating the schema
        if getattr(self, 'swagger_fake_view', False):
            return Website.objects.none()

        # Check if the user is authenticated
        if not self.request.user.is_authenticated:
            raise NotAuthenticated("User must be authenticated to view websites.")
        
        # Return the queryset filtered by the authenticated user
        return Website.objects.filter(user=self.request.user)

class LogoutView(APIView):

    def get_serializer_class(self):
        if getattr(self, 'swagger_fake_view', False):
            return None
        return None

    def post(self, request):
        return Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)
    

class GenerateRAGView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('description', openapi.IN_FORM, type=openapi.TYPE_STRING, description='Document description'),
            openapi.Parameter('template', openapi.IN_FORM, type=openapi.TYPE_STRING, description='Website template'),
            openapi.Parameter('documents', openapi.IN_FORM, type=openapi.TYPE_FILE, description='Upload document'),
        ]
    )
    def post(self, request, *args, **kwargs):
        serializer = RAGRequestSerializer(data=request.data)

        if serializer.is_valid():
            description = serializer.validated_data['description']
            template = serializer.validated_data['template']
            document = serializer.validated_data['documents']  

            result = process_rag(description, template, document)

            return Response({"message": "RAG successfully generated", "result": result}, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
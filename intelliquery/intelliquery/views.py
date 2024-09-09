# views.py - Define your API views here

from rest_framework import generics, viewsets, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response  # Import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from django.contrib.auth.models import User
from .serializers import UserSerializer, WebappSerializer, RAGRequestSerializer
from rest_framework.exceptions import NotAuthenticated
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from .service.process_rag import process_rag
from .service import WebsiteGenerator
from rest_framework.parsers import MultiPartParser, FormParser
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from .models import Webapp, Document




class RegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]  # Allow anyone to register (no authentication required)
    queryset = User.objects.all()
    serializer_class = UserSerializer


class WebappViewSet(viewsets.ModelViewSet):
    serializer_class = WebappSerializer

    def get_queryset(self):
        # Skip authentication check if swagger is generating the schema
        if getattr(self, 'swagger_fake_view', False):
            return Webapp.objects.none()

        # Check if the user is authenticated
        if not self.request.user.is_authenticated:
            raise NotAuthenticated("User must be authenticated to view websites.")
        
        # Return the queryset filtered by the authenticated user
        return Webapp.objects.filter(user=self.request.user)
    


class LogoutView(APIView):

    def get_serializer_class(self):
        if getattr(self, 'swagger_fake_view', False):
            return None
        return None

    def post(self, request):
        return Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)
    

class GenerateRAGView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]  # Ensure only authenticated users can access

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('description', openapi.IN_FORM, type=openapi.TYPE_STRING, description='Document description'),
            openapi.Parameter('template', openapi.IN_FORM, type=openapi.TYPE_STRING, description='Website template'),
            openapi.Parameter('documents', openapi.IN_FORM, type=openapi.TYPE_FILE, description='Upload documents', multiple=True),
        ]
    )
    def post(self, request, *args, **kwargs):
        serializer = RAGRequestSerializer(data=request.data)
        if serializer.is_valid():
            description = serializer.validated_data['description']
            template = serializer.validated_data['template']
            docs = request.FILES.getlist('documents')

            try:
                result = process_rag(description, template, docs) 
                url = result.get("url")
                namespace = result.get("namespace_idx")
                site_id = result.get("site_id")

                webapp_data = {
                    'description': description,
                    'template': template,
                    'url': url
                }

                webapp_serializer = WebappSerializer(data=webapp_data, context={'request': request})
                if webapp_serializer.is_valid():
                    webapp = webapp_serializer.save()

                    # Save documents asynchronously
                    for doc in docs:
                        Document.objects.create(webapp=webapp, document=doc)

                    return Response({"message": "RAG successfully generated", "url": url, "namespace": namespace}, status=status.HTTP_200_OK)
                else:
                    return Response(webapp_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AlterWebsiteView(APIView):
    permission_classes = [IsAuthenticated]
    #TODO Continue here Luka!

    



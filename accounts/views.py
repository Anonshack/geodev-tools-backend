# from rest_framework import generics, permissions, status
# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.response import Response
# from .serializers import UserRegisterSerializer, UserSerializer
# from .models import User
#
# class RegisterView(generics.CreateAPIView):
#     queryset = User.objects.all()
#     serializer_class = UserRegisterSerializer
#     permission_classes = [permissions.AllowAny]
#
# class ProfileView(generics.RetrieveUpdateAPIView):
#     serializer_class = UserSerializer
#     permission_classes = [permissions.IsAuthenticated]
#
#     def get_object(self):
#         return self.request.user
#
# @api_view(['POST'])
# @permission_classes([permissions.IsAuthenticated])
# def generate_api_key(request):
#     user = request.user
#     key = user.generate_api_key()
#     return Response({'api_key': key}, status=status.HTTP_200_OK)

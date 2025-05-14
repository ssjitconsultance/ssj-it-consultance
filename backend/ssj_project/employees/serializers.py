# backend/employees/serializers.py

from rest_framework import serializers
from .models import Employee, Resume
from accounts.serializers import UserSerializer

class EmployeeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Employee
        fields = '__all__'

class EmployeeCreateSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    
    class Meta:
        model = Employee
        fields = ['email', 'password', 'first_name', 'last_name', 'position', 'department', 'phone', 'address', 'profile_picture']
    
    def create(self, validated_data):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        email = validated_data.pop('email')
        password = validated_data.pop('password')
        
        user = User.objects.create_user(
            email=email,
            password=password,
            user_type='employee'
        )
        
        employee = Employee.objects.create(user=user, **validated_data)
        return employee

class ResumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = '__all__'
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Employee, Attendance, LeaveRequest

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'user_type', 'employee_id']
        read_only_fields = ['employee_id']
        extra_kwargs = {
            'password': {'write_only': True}
        }


class EmployeeSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    employee_id = serializers.CharField(source='user.employee_id', read_only=True)
    
    class Meta:
        model = Employee
        fields = [
            'id', 'user', 'user_email', 'employee_id', 'first_name', 'last_name',
            'position', 'department', 'phone', 'address', 'profile_picture', 'date_joined'
        ]
        read_only_fields = ['date_joined']


class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Attendance
        fields = ['id', 'employee', 'employee_name', 'date', 'status', 'time_in', 'time_out']
    
    def get_employee_name(self, obj):
        return f"{obj.employee.first_name} {obj.employee.last_name}"


class LeaveRequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    
    class Meta:
        model = LeaveRequest
        fields = [
            'id', 'employee', 'employee_name', 'start_date', 'end_date',
            'reason', 'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_employee_name(self, obj):
        return f"{obj.employee.first_name} {obj.employee.last_name}"

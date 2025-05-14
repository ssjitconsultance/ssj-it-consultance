# backend/attendance/views.py

from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Attendance, LeaveRequest
from .serializers import AttendanceSerializer, LeaveRequestSerializer
from employees.models import Employee
from django.utils import timezone
from django.db.models import Q

class IsAdminOrSelf(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.is_staff or obj.employee.user == request.user

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    
    def get_permissions(self):
        if self.action in ['clock_in', 'clock_out', 'my_attendance']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAdminUser]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        queryset = Attendance.objects.all()
        if self.request.user.is_staff:
            return queryset
        try:
            employee = Employee.objects.get(user=self.request.user)
            return queryset.filter(employee=employee)
        except Employee.DoesNotExist:
            return Attendance.objects.none()
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def clock_in(self, request):
        try:
            employee = Employee.objects.get(user=request.user)
            today = timezone.now().date()
            
            attendance, created = Attendance.objects.get_or_create(
                employee=employee,
                date=today,
                defaults={'time_in': timezone.now()}
            )
            
            if not created and not attendance.time_in:
                attendance.time_in = timezone.now()
                attendance.save()
            
            return Response(AttendanceSerializer(attendance).data)
        except Employee.DoesNotExist:
            return Response(
                {"detail": "Employee profile not found."},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def clock_out(self, request):
        try:
            employee = Employee.objects.get(user=request.user)
            today = timezone.now().date()
            
            try:
                attendance = Attendance.objects.get(employee=employee, date=today)
                attendance.time_out = timezone.now()
                attendance.save()
                return Response(AttendanceSerializer(attendance).data)
            except Attendance.DoesNotExist:
                return Response(
                    {"detail": "No clock-in record found for today."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Employee.DoesNotExist:
            return Response(
                {"detail": "Employee profile not found."},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_attendance(self, request):
        try:
            employee = Employee.objects.get(user=request.user)
            attendances = Attendance.objects.filter(employee=employee).order_by('-date')
            page = self.paginate_queryset(attendances)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            serializer = self.get_serializer(attendances, many=True)
            return Response(serializer.data)
        except Employee.DoesNotExist:
            return Response(
                {"detail": "Employee profile not found."},
                status=status.HTTP_404_NOT_FOUND
            )

class LeaveRequestViewSet(viewsets.ModelViewSet):
    queryset = LeaveRequest.objects.all()
    serializer_class = LeaveRequestSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'my_leave_requests']:
            permission_classes = [permissions.IsAuthenticated]
        elif self.action in ['retrieve', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminOrSelf]
        else:
            permission_classes = [permissions.IsAdminUser]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        queryset = LeaveRequest.objects.all()
        if self.request.user.is_staff:
            return queryset
        try:
            employee = Employee.objects.get(user=self.request.user)
            return queryset.filter(employee=employee)
        except Employee.DoesNotExist:
            return LeaveRequest.objects.none()
    
    def perform_create(self, serializer):
        try:
            employee = Employee.objects.get(user=self.request.user)
            serializer.save(employee=employee)
        except Employee.DoesNotExist:
            raise serializers.ValidationError("Employee profile not found.")
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_leave_requests(self, request):
        try:
            employee = Employee.objects.get(user=request.user)
            leave_requests = LeaveRequest.objects.filter(employee=employee).order_by('-created_at')
            page = self.paginate_queryset(leave_requests)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            serializer = self.get_serializer(leave_requests, many=True)
            return Response(serializer.data)
        except Employee.DoesNotExist:
            return Response(
                {"detail": "Employee profile not found."},
                status=status.HTTP_404_NOT_FOUND
            )
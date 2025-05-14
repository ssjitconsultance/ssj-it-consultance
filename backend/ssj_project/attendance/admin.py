# backend/attendance/admin.py

from django.contrib import admin
from .models import Attendance, LeaveRequest

@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('employee', 'date', 'time_in', 'time_out', 'status')
    list_filter = ('date', 'status')
    search_fields = ('employee__first_name', 'employee__last_name')

@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):
    list_display = ('employee', 'start_date', 'end_date', 'status')
    list_filter = ('status', 'start_date')
    search_fields = ('employee__first_name', 'employee__last_name', 'reason')
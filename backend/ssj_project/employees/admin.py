# backend/employees/admin.py

from django.contrib import admin
from .models import Employee, Resume

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'position', 'department', 'date_joined')
    search_fields = ('first_name',  'last_name', 'position', 'department')
    list_filter = ('department', 'date_joined')

@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'submitted_at')
    search_fields = ('name', 'email')
    list_filter = ('submitted_at',)
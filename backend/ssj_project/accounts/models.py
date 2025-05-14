from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager, PermissionsMixin
from django.utils.translation import gettext_lazy as _
import random
import string
import datetime 

class CustomUserManager(BaseUserManager):
    """Define a model manager for User model with no username field."""

    def _create_user(self, email, password=None, **extra_fields):
        """Create and save a User with the given email and password."""
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            # Generate a random password if none is provided
            password = ''.join(random.choices(string.ascii_letters + string.digits, k=12))
            user.set_password(password)
        user.save(using=self._db)
        return user, password

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)[0]

    def create_superuser(self, email, password=None, **extra_fields):
        """Create and save a SuperUser with the given email and password."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('user_type', 'admin')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self._create_user(email, password, **extra_fields)[0]


class User(AbstractUser):
    """Custom User model with email as the unique identifier."""
    USER_TYPE_CHOICES = (
        ('admin', 'Admin'),
        ('employee', 'Employee'),
        ('guest', 'Guest'),
    )
    
    username = None  # Remove username field
    email = models.EmailField(_('email address'), unique=True)
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES, default='guest')
    employee_id = models.CharField(max_length=10, unique=True, null=True, blank=True)
    
    USERNAME_FIELD = 'email'  # Use email as the username field for authentication
    REQUIRED_FIELDS = []  # Email is already required by default
    
    objects = CustomUserManager()
    
    class Meta:
        db_table = 'accounts_user'
        swappable = 'AUTH_USER_MODEL'
    
    def __str__(self):
        return self.email


class Employee(models.Model):
    """Employee profile model."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='employee_profile')
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    position = models.CharField(max_length=100)
    department = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)
    date_joined = models.DateField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    def save(self, *args, **kwargs):
        # Generate employee ID if not already set
        if not self.user.employee_id:
        # Get current year's last two digits
            current_year = str(datetime.datetime.now().year)[-2:]
        
        # Get department code (default to 1 if not available)
            dept_code = '1'  # Default department code
            if self.department:
            # Map department names to codes
                dept_mapping = {
                'IT': '1',
                'HR': '2',
                'Finance': '3',
                'Marketing': '4',
                'Sales': '5',
                'Operations': '6',
                'Customer Support': '7'
            }
                dept_code = dept_mapping.get(self.department, '1')
        
        # Get the latest employee with the same year and department
            latest_employee = Employee.objects.filter(user__employee_id__startswith=f"{current_year}{dept_code}"
        ).order_by('-user__employee_id').first()
        
            if latest_employee and latest_employee.user.employee_id:
            # Extract the numeric part and increment
                try:
                    emp_num = int(latest_employee.user.employee_id[3:])
                    self.user.employee_id = f"{current_year}{dept_code}{(emp_num + 1):04d}"
                except ValueError:
                # Fallback if format is different
                    self.user.employee_id = f"{current_year}{dept_code}0001"
            else:
            # First employee with this year and department
               self.user.employee_id = f"{current_year}{dept_code}0001"
        
            self.user.save()
    
        super().save(*args, **kwargs)


class Attendance(models.Model):
    """Employee attendance model."""
    STATUS_CHOICES = (
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('late', 'Late'),
        ('half_day', 'Half Day'),
    )
    
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='attendances')
    date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='present')
    time_in = models.DateTimeField(null=True, blank=True)
    time_out = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ('employee', 'date')
    
    def __str__(self):
        return f"{self.employee} - {self.date} - {self.status}"


class LeaveRequest(models.Model):
    """Employee leave request model."""
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )
    
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='leave_requests')
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.employee} - {self.start_date} to {self.end_date} - {self.status}"

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model, authenticate, login
from .models import Employee, Attendance, LeaveRequest
from .serializers import UserSerializer, EmployeeSerializer, AttendanceSerializer, LeaveRequestSerializer
from .utils import generate_random_password, send_employee_credentials
from django.utils import timezone
from datetime import date
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAdminUser
from django.core.management import call_command
from .graph_utils import send_email_with_graph, get_microsoft_users

User = get_user_model()

class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom token view that handles different user types."""
    
    def post(self, request, *args, **kwargs):
        # Extract data from request
        email = request.data.get('email')
        employee_id = request.data.get('employee_id')
        password = request.data.get('password')
        user_type = request.data.get('user_type', 'guest')
        
        # Determine username based on user_type
        username = email
        if user_type == 'employee' and employee_id:
            username = employee_id
        
        # Authenticate user with our custom backend
        user = authenticate(
            request=request,
            username=username,
            password=password,
            user_type=user_type
        )
        
        if user:
            # Login the user
            login(request, user)
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            # Add custom claims
            refresh['user_type'] = user.user_type
            refresh['email'] = user.email
            refresh['name'] = f"{user.first_name} {user.last_name}"
            
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'user_type': user.user_type,
                    'employee_id': user.employee_id,
                    'is_superuser': user.is_superuser,
                }
            })
        else:
            return Response(
                {'non_field_errors': ['Unable to log in with provided credentials.']},
                status=status.HTTP_400_BAD_REQUEST
            )

class UserViewSet(viewsets.ModelViewSet):
    """API endpoint for managing users."""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        """Filter users based on user permissions."""
        user = self.request.user
        
        if user.is_superuser or user.user_type == 'admin':
            return User.objects.all()
        else:
            return User.objects.filter(id=user.id)


class EmployeeViewSet(viewsets.ModelViewSet):
    """API endpoint for managing employees."""
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        """Create a new employee with user account."""
        data = request.data
        
        # Generate a random password
        password = generate_random_password()
        
        # Create user account
        user_data = {
            'email': data.get('email'),
            'first_name': data.get('first_name'),
            'last_name': data.get('last_name'),
            'user_type': 'employee',
        }
        
        user = User.objects.create_user(
            email=user_data['email'],
            password=password,
            first_name=user_data['first_name'],
            last_name=user_data['last_name'],
            user_type='employee'
        )
        
        # Create employee profile
        employee_data = {
            'user': user.id,
            'first_name': data.get('first_name'),
            'last_name': data.get('last_name'),
            'position': data.get('position'),
            'department': data.get('department'),
            'phone': data.get('phone'),
            'address': data.get('address'),
        }
        
        serializer = self.get_serializer(data=employee_data)
        serializer.is_valid(raise_exception=True)
        employee = serializer.save()
        
        # Send credentials to employee if requested
        if data.get('send_credentials', True):
            send_employee_credentials(employee, password)
        
        headers = self.get_success_headers(serializer.data)
        response_data = serializer.data
        response_data['employee_id'] = user.employee_id
        
        return Response(response_data, status=status.HTTP_201_CREATED, headers=headers)
    
    # accounts/views.py - Update the EmployeeViewSet destroy method

    def destroy(self, request, *args, **kwargs):
        """Delete an employee and their user account."""
        employee = self.get_object()
        user = employee.user
    
    # Delete the employee first
        employee.delete()
    
    # Then delete the user
        user.delete()
    
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    def get_queryset(self):
        """Filter employees based on user permissions."""
        user = self.request.user
        
        if user.user_type == 'admin':
            return Employee.objects.all()
        elif user.user_type == 'employee':
            # Employees can only see their own profile
            return Employee.objects.filter(user=user)
        else:
            return Employee.objects.none()


# In your views.py, modify the get_employee_profile function
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_employee_profile(request):
    """Get the current employee's profile."""
    if request.user.user_type != 'employee':
        return Response({"detail": "Not an employee user."}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        employee = Employee.objects.get(user=request.user)
        serializer = EmployeeSerializer(employee)
        return Response(serializer.data)
    except Employee.DoesNotExist:
        # Create a basic profile if it doesn't exist
        employee = Employee.objects.create(
            user=request.user,
            first_name=request.user.first_name,
            last_name=request.user.last_name,
            department="Unassigned",
            position="Employee"
        )
        serializer = EmployeeSerializer(employee)
        return Response(serializer.data)


class AttendanceViewSet(viewsets.ModelViewSet):
    """API endpoint for managing attendance records."""
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter attendance records based on user permissions."""
        user = self.request.user
        
        if user.user_type == 'admin':
            return Attendance.objects.all()
        elif user.user_type == 'employee':
            # Employees can only see their own attendance
            try:
                employee = Employee.objects.get(user=user)
                return Attendance.objects.filter(employee=employee)
            except Employee.DoesNotExist:
                return Attendance.objects.none()
        else:
            return Attendance.objects.none()


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def clock_in(request):
    """Clock in for the current day."""
    if request.user.user_type != 'employee':
        return Response({"detail": "Not an employee user."}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        employee = Employee.objects.get(user=request.user)
        today = date.today()
        
        # Check if attendance record exists for today
        attendance, created = Attendance.objects.get_or_create(
            employee=employee,
            date=today,
            defaults={
                'status': 'present',
                'time_in': timezone.now(),
            }
        )
        
        if not created and not attendance.time_in:
            attendance.time_in = timezone.now()
            attendance.status = 'present'
            attendance.save()
        
        serializer = AttendanceSerializer(attendance)
        return Response(serializer.data)
    except Employee.DoesNotExist:
        return Response({"detail": "Employee profile not found."}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def clock_out(request):
    """Clock out for the current day."""
    if request.user.user_type != 'employee':
        return Response({"detail": "Not an employee user."}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        employee = Employee.objects.get(user=request.user)
        today = date.today()
        
        try:
            attendance = Attendance.objects.get(employee=employee, date=today)
            
            if not attendance.time_in:
                return Response({"detail": "You need to clock in first."}, status=status.HTTP_400_BAD_REQUEST)
            
            attendance.time_out = timezone.now()
            attendance.save()
            
            serializer = AttendanceSerializer(attendance)
            return Response(serializer.data)
        except Attendance.DoesNotExist:
            return Response({"detail": "No attendance record found for today."}, status=status.HTTP_404_NOT_FOUND)
    except Employee.DoesNotExist:
        return Response({"detail": "Employee profile not found."}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_attendance(request):
    """Get the current employee's attendance records."""
    if request.user.user_type != 'employee':
        return Response({"detail": "Not an employee user."}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        employee = Employee.objects.get(user=request.user)
        attendance = Attendance.objects.filter(employee=employee).order_by('-date')
        serializer = AttendanceSerializer(attendance, many=True)
        return Response(serializer.data)
    except Employee.DoesNotExist:
        return Response({"detail": "Employee profile not found."}, status=status.HTTP_404_NOT_FOUND)


class LeaveRequestViewSet(viewsets.ModelViewSet):
    """API endpoint for managing leave requests."""
    queryset = LeaveRequest.objects.all()
    serializer_class = LeaveRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter leave requests based on user permissions."""
        user = self.request.user
        
        if user.user_type == 'admin':
            return LeaveRequest.objects.all()
        elif user.user_type == 'employee':
            # Employees can only see their own leave requests
            try:
                employee = Employee.objects.get(user=user)
                return LeaveRequest.objects.filter(employee=employee)
            except Employee.DoesNotExist:
                return LeaveRequest.objects.none()
        else:
            return LeaveRequest.objects.none()
    
    def create(self, request, *args, **kwargs):
        """Create a new leave request."""
        if request.user.user_type != 'employee':
            return Response({"detail": "Only employees can create leave requests."}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            employee = Employee.objects.get(user=request.user)
            data = request.data.copy()
            data['employee'] = employee.id
            
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except Employee.DoesNotExist:
            return Response({"detail": "Employee profile not found."}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def approve(self, request, pk=None):
        """Approve a leave request."""
        leave_request = self.get_object()
        leave_request.status = 'approved'
        leave_request.save()
        
        serializer = self.get_serializer(leave_request)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def reject(self, request, pk=None):
        """Reject a leave request."""
        leave_request = self.get_object()
        leave_request.status = 'rejected'
        leave_request.save()
        
        serializer = self.get_serializer(leave_request)
        return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_leave_requests(request):
    """Get the current employee's leave requests."""
    if request.user.user_type != 'employee':
        return Response({"detail": "Not an employee user."}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        employee = Employee.objects.get(user=request.user)
        leave_requests = LeaveRequest.objects.filter(employee=employee).order_by('-created_at')
        serializer = LeaveRequestSerializer(leave_requests, many=True)
        return Response(serializer.data)
    except Employee.DoesNotExist:
        return Response({"detail": "Employee profile not found."}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def send_credentials(request):
    """Send login credentials to an employee."""
    email = request.data.get('email')
    password = request.data.get('password')
    first_name = request.data.get('first_name')
    last_name = request.data.get('last_name')
    
    try:
        user = User.objects.get(email=email)
        employee = Employee.objects.get(user=user)
        
        success = send_employee_credentials(employee, password)
        
        if success:
            return Response({"detail": "Credentials sent successfully."})
        else:
            return Response({"detail": "Failed to send credentials."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except (User.DoesNotExist, Employee.DoesNotExist):
        return Response({"detail": "Employee not found."}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def sync_microsoft_users(request):
    """
    API endpoint to sync users from Microsoft 365
    """
    send_credentials = request.data.get('send_credentials', False)
    
    try:
        # Call the management command
        call_command('sync_microsoft_users', send_credentials=send_credentials)
        return Response({'success': True, 'message': 'User sync initiated successfully'})
    except Exception as e:
        return Response({'success': False, 'message': f'Error syncing users: {str(e)}'}, status=500)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def send_email_view(request):
    """
    API endpoint for sending emails using Microsoft Graph API
    """
    to_email = request.data.get('to')
    subject = request.data.get('subject')
    template = request.data.get('template')
    context = request.data.get('context', {})
    
    # Handle different email templates
    if template == 'employee_credentials':
        body = f"""
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #0078d4; color: white; padding: 10px 20px; }}
                .content {{ padding: 20px; border: 1px solid #ddd; }}
                .credentials {{ background-color: #f9f9f9; padding: 15px; margin: 15px 0; border-left: 4px solid #0078d4; }}
                .footer {{ font-size: 12px; color: #777; margin-top: 20px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>SSJ IT Consultance</h2>
                </div>
                <div class="content">
                    <p>Hello {context.get('first_name')} {context.get('last_name')},</p>
                    
                    <p>Welcome to SSJ IT Consultance! Your account has been created.</p>
                    
                    <div class="credentials">
                        <p><strong>Your login credentials are:</strong></p>
                        <p>Email: {context.get('email')}</p>
                        <p>Password: {context.get('password')}</p>
                    </div>
                    
                    <p>Please login at: <a href="https://ssjconsultance.com/login">https://ssjconsultance.com/login</a></p>
                    
                    <p>For security reasons, please change your password after your first login.</p>
                    
                    <p>Best regards,<br>SSJ IT Consultance HR Team</p>
                </div>
                <div class="footer">
                    <p>This is an automated message. Please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
        """
    else:
        # Default template
        body = request.data.get('body', '')
    
    # Send email using Graph API
    success = send_email_with_graph(
        to_email=to_email,
        subject=subject,
        body=body
    )
    
    if success:
        return Response({'success': True, 'message': 'Email sent successfully'})
    else:
        return Response({'success': False, 'message': 'Failed to send email'}, status=500)

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

router = DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'employees', views.EmployeeViewSet)
router.register(r'attendance', views.AttendanceViewSet)
router.register(r'leave-requests', views.LeaveRequestViewSet)

urlpatterns = [
    path('', include(router.urls)),
    
    # JWT Authentication
    path('auth/token/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Employee endpoints
    path('employee/profile/', views.get_employee_profile, name='employee_profile'),
    path('employee/clock-in/', views.clock_in, name='clock_in'),
    path('employee/clock-out/', views.clock_out, name='clock_out'),
    path('employee/attendance/', views.my_attendance, name='my_attendance'),
    path('employee/leave-requests/', views.my_leave_requests, name='my_leave_requests'),
    
    # Admin endpoints
    path('admin/send-credentials/', views.send_credentials, name='send_credentials'),
    path('admin/sync-microsoft-users/', views.sync_microsoft_users, name='sync_microsoft_users'),
    
    # Email endpoint
    path('send-email/', views.send_email_view, name='send_email'),
]

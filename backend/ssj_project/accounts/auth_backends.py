from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend
from django.db.models import Q

User = get_user_model()

class CustomAuthBackend(ModelBackend):
    """
    Custom authentication backend that supports login with email, employee_id, or username
    based on the user_type.
    """
    
    def authenticate(self, request, username=None, password=None, user_type=None, **kwargs):
        try:
            # Different authentication logic based on user type
            if user_type == 'employee':
                # Employees login with employee_id
                user = User.objects.get(employee_id=username)
            elif user_type in ['admin', 'guest']:
                # Admins and guests login with email
                user = User.objects.get(email=username)
            else:
                # Fallback to email or employee_id
                user = User.objects.get(
                    Q(email=username) | Q(employee_id=username)
                )
                
            # Check password
            if user.check_password(password):
                # Verify user type if specified
                if user_type and user.user_type != user_type and not (user_type == 'admin' and user.is_superuser):
                    return None
                return user
                
        except User.DoesNotExist:
            return None
        
        return None

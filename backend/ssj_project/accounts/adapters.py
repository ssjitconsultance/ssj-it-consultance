from allauth.account.adapter import DefaultAccountAdapter
from django.conf import settings

class CustomAccountAdapter(DefaultAccountAdapter):
    def save_user(self, request, user, form, commit=True):
        """
        This is called when saving user via allauth registration.
        We override this to set user_type from the registration form.
        """
        # Call the parent save_user but don't commit yet
        user = super().save_user(request, user, form, commit=False)
        
        # Get user_type from the form data
        data = getattr(request, 'data', {})
        user_type = data.get('user_type', 'guest')
        if user_type in ['admin', 'employee', 'guest']:
            user.user_type = user_type
        
        if commit:
            user.save()
        return user

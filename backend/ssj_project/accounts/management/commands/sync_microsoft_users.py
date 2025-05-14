import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from accounts.models import Employee
from accounts.utils import generate_random_password, send_employee_credentials
from accounts.graph_utils import get_microsoft_users

User = get_user_model()

class Command(BaseCommand):
    help = 'Sync users from Microsoft 365 to the application'

    def add_arguments(self, parser):
        parser.add_argument(
            '--send-credentials',
            action='store_true',
            help='Send credentials to new users',
        )

    def handle(self, *args, **options):
        send_credentials = options['send_credentials']
        
        # Get users from Microsoft Graph API
        ms_users = get_microsoft_users()
        
        if not ms_users:
            self.stdout.write(self.style.ERROR('Failed to get users from Microsoft 365'))
            return
        
        self.stdout.write(f"Found {len(ms_users)} users in Microsoft 365")
        
        # Track statistics
        created_count = 0
        updated_count = 0
        error_count = 0
        
        for ms_user in ms_users:
            try:
                email = ms_user.get('mail') or ms_user.get('userPrincipalName')
                if not email:
                    self.stdout.write(self.style.WARNING(f"Skipping user without email: {ms_user.get('displayName')}"))
                    continue
                
                # Check if user already exists
                user, created = User.objects.get_or_create(
                    email=email,
                    defaults={
                        'first_name': ms_user.get('givenName', ''),
                        'last_name': ms_user.get('surname', ''),
                        'user_type': 'employee',
                    }
                )
                
                if created:
                    # Generate a random password for new users
                    password = generate_random_password()
                    user.set_password(password)
                    user.save()
                    
                    # Create or update employee profile
                    employee, emp_created = Employee.objects.get_or_create(
                        user=user,
                        defaults={
                            'first_name': ms_user.get('givenName', ''),
                            'last_name': ms_user.get('surname', ''),
                            'position': ms_user.get('jobTitle', ''),
                            'department': ms_user.get('department', ''),
                            'phone': ms_user.get('mobilePhone', ''),
                            'address': ms_user.get('officeLocation', ''),
                        }
                    )
                    
                    # Send credentials if requested
                    if send_credentials:
                        success = send_employee_credentials(employee, password)
                        if success:
                            self.stdout.write(self.style.SUCCESS(f"Sent credentials to {email}"))
                        else:
                            self.stdout.write(self.style.WARNING(f"Failed to send credentials to {email}"))
                    
                    created_count += 1
                    self.stdout.write(self.style.SUCCESS(f"Created user: {email}"))
                else:
                    # Update existing user
                    user.first_name = ms_user.get('givenName', user.first_name)
                    user.last_name = ms_user.get('surname', user.last_name)
                    user.save()
                    
                    # Update employee profile
                    employee, emp_created = Employee.objects.get_or_create(
                        user=user,
                        defaults={
                            'first_name': ms_user.get('givenName', ''),
                            'last_name': ms_user.get('surname', ''),
                        }
                    )
                    
                    if not emp_created:
                        employee.first_name = ms_user.get('givenName', employee.first_name)
                        employee.last_name = ms_user.get('surname', employee.last_name)
                        employee.position = ms_user.get('jobTitle', employee.position)
                        employee.department = ms_user.get('department', employee.department)
                        employee.phone = ms_user.get('mobilePhone', employee.phone)
                        employee.address = ms_user.get('officeLocation', employee.address)
                        employee.save()
                    
                    updated_count += 1
                    self.stdout.write(self.style.SUCCESS(f"Updated user: {email}"))
            
            except Exception as e:
                error_count += 1
                self.stdout.write(self.style.ERROR(f"Error processing user {ms_user.get('userPrincipalName')}: {str(e)}"))
        
        # Print summary
        self.stdout.write(self.style.SUCCESS(f"Sync completed: {created_count} created, {updated_count} updated, {error_count} errors"))

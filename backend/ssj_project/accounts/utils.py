import random
import string
from django.conf import settings
from .graph_utils import send_email_with_graph

def generate_random_password(length=12):
    """Generate a random password of specified length."""
    # Include at least one of each: uppercase, lowercase, digit, and special character
    uppercase = random.choice(string.ascii_uppercase)
    lowercase = random.choice(string.ascii_lowercase)
    digit = random.choice(string.digits)
    special = random.choice('!@#$%^&*()_+-=[]{}|;:,.<>?')
    
    # Fill the rest with a mix of characters
    remaining_length = length - 4  # 4 characters are already chosen
    remaining_chars = ''.join(random.choices(
        string.ascii_letters + string.digits + '!@#$%^&*()_+-=[]{}|;:,.<>?',
        k=remaining_length
    ))
    
    # Combine all characters and shuffle
    all_chars = uppercase + lowercase + digit + special + remaining_chars
    password_chars = list(all_chars)
    random.shuffle(password_chars)
    
    return ''.join(password_chars)

def send_employee_credentials(employee, password):
    """Send login credentials to a new employee using Microsoft Graph API."""
    subject = 'Your SSJ IT Consultance Account Credentials'
    
    # Create HTML email body
    html_body = f"""
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
                <p>Hello {employee.first_name} {employee.last_name},</p>
                
                <p>Welcome to SSJ IT Consultance! Your account has been created.</p>
                
                <div class="credentials">
                    <p><strong>Your login credentials are:</strong></p>
                    <p>Employee ID: {employee.user.employee_id}</p>
                    <p>Password: {password}</p>
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
    
    recipient_email = employee.user.email
    
    try:
        # Use Graph API to send email
        success = send_email_with_graph(
            to_email=recipient_email,
            subject=subject,
            body=html_body
        )
        return success
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

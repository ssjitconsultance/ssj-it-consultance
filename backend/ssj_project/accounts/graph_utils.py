import requests
from django.conf import settings


def get_graph_access_token():
    """
    Get Microsoft Graph API access token using client credentials flow
    """
    try:
        token_url = f"https://login.microsoftonline.com/{settings.MS_GRAPH_TENANT_ID}/oauth2/v2.0/token"
        token_data = {
            'grant_type': 'client_credentials',
            'client_id': settings.MS_GRAPH_CLIENT_ID,
            'client_secret': settings.MS_GRAPH_CLIENT_SECRET,
            'scope': 'https://graph.microsoft.com/.default'
        }

        response = requests.post(token_url, data=token_data)
        response.raise_for_status()
        return response.json().get('access_token')
    except Exception as e:
        print(f"Error acquiring token: {e}")
        return None


def send_email_with_graph(to_email, subject, body):
    """
    Send email using Microsoft Graph API from a shared mailbox
    """
    access_token = get_graph_access_token()
    if not access_token:
        print("Failed to acquire token")
        return False

    try:
        graph_endpoint = f"https://graph.microsoft.com/v1.0/users/{settings.SHARED_MAILBOX_ADDRESS}/sendMail"
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }

        email_data = {
            'message': {
                'subject': subject,
                'body': {
                    'contentType': 'HTML',
                    'content': body
                },
                'toRecipients': [
                    {
                        'emailAddress': {
                            'address': to_email
                        }
                    }
                ]
            },
            'saveToSentItems': 'true'
        }

        response = requests.post(graph_endpoint, headers=headers, json=email_data)
        response.raise_for_status()
        return True
    except Exception as e:
        print(f"Error sending email via Graph API: {e}")
        return False


def get_microsoft_users():
    """
    Get all enabled users from Microsoft Graph API
    """
    access_token = get_graph_access_token()
    if not access_token:
        print("Failed to acquire token")
        return None

    try:
        graph_endpoint = 'https://graph.microsoft.com/v1.0/users'
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        params = {
            '$select': 'id,displayName,givenName,surname,mail,userPrincipalName,jobTitle,department,mobilePhone,officeLocation',
            '$filter': 'accountEnabled eq true'
        }

        response = requests.get(graph_endpoint, headers=headers, params=params)
        response.raise_for_status()
        return response.json().get('value', [])
    except Exception as e:
        print(f"Error getting users: {e}")
        return None

import os
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'))

SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']

CLIENT_CONFIG = {
    "web": {
        "client_id": os.getenv("GOOGLE_CLIENT_ID"),
        "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "redirect_uris": ["http://localhost:8000/calendar/callback"]
    }
}

def get_auth_url():
    flow = Flow.from_client_config(
        CLIENT_CONFIG,
        scopes=SCOPES,
        redirect_uri="http://localhost:8000/calendar/callback"
    )
    auth_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true',
        prompt='consent'
    )
    return auth_url, state

def get_credentials_from_code(code: str):
    flow = Flow.from_client_config(
        CLIENT_CONFIG,
        scopes=SCOPES,
        redirect_uri="http://localhost:8000/calendar/callback"
    )
    flow.fetch_token(
        code=code,
        include_client_id=True
    )
    credentials = flow.credentials
    return {
        "token": credentials.token,
        "refresh_token": credentials.refresh_token,
        "token_uri": credentials.token_uri,
        "client_id": credentials.client_id,
        "client_secret": credentials.client_secret,
        "scopes": list(credentials.scopes) if credentials.scopes else []
    }

def get_upcoming_meetings(credentials_dict: dict):
    credentials = Credentials(
        token=credentials_dict["token"],
        refresh_token=credentials_dict.get("refresh_token"),
        token_uri=credentials_dict["token_uri"],
        client_id=credentials_dict["client_id"],
        client_secret=credentials_dict["client_secret"]
    )
    service = build('calendar', 'v3', credentials=credentials)

    from datetime import datetime, timezone
    now = datetime.now(timezone.utc).isoformat()

    events_result = service.events().list(
        calendarId='primary',
        timeMin=now,
        maxResults=10,
        singleEvents=True,
        orderBy='startTime'
    ).execute()

    events = events_result.get('items', [])
    meetings = []

    for event in events:
        start = event['start'].get('dateTime', event['start'].get('date'))
        meetings.append({
            "title": event.get('summary', 'No Title'),
            "start": start,
            "attendees": [a['email'] for a in event.get('attendees', [])],
            "meet_link": event.get('hangoutLink', None)
        })

    return meetings
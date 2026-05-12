from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from database import get_db
from routers.auth import get_current_user
from models.user import User
from services.calendar_service import get_auth_url, get_credentials_from_code, get_upcoming_meetings

router = APIRouter(prefix="/calendar", tags=["calendar"])

# Temporary in-memory store for credentials (for demo purposes)
user_credentials = {}

@router.get("/connect")
def connect_calendar(current_user: User = Depends(get_current_user)):
    auth_url, state = get_auth_url()
    return {"auth_url": auth_url}

@router.get("/callback")
def calendar_callback(code: str, db: Session = Depends(get_db)):
    try:
        credentials = get_credentials_from_code(code)
        # Store temporarily with a demo key
        user_credentials["demo"] = credentials
        return {"message": "Calendar connected successfully!"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/meetings")
def get_calendar_meetings(current_user: User = Depends(get_current_user)):
    if "demo" not in user_credentials:
        raise HTTPException(status_code=400, detail="Calendar not connected. Call /calendar/connect first.")
    meetings = get_upcoming_meetings(user_credentials["demo"])
    return {"upcoming_meetings": meetings}
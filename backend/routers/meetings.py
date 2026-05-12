from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.meeting import Meeting
from models.participant import Participant
from models.consent_log import ConsentLog
from routers.auth import get_current_user
from models.user import User
from datetime import datetime
import uuid

router = APIRouter(prefix="/meetings", tags=["meetings"])

@router.post("/")
def create_meeting(title: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    meeting = Meeting(title=title, host_id=current_user.id, status="scheduled")
    db.add(meeting)
    db.commit()
    db.refresh(meeting)
    return {"id": str(meeting.id), "title": meeting.title, "status": meeting.status}

@router.get("/")
def get_meetings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    meetings = db.query(Meeting).filter(Meeting.host_id == current_user.id).all()
    return [{"id": str(m.id), "title": m.title, "status": m.status, "created_at": str(m.created_at)} for m in meetings]

@router.get("/{meeting_id}")
def get_meeting(meeting_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return {"id": str(meeting.id), "title": meeting.title, "status": meeting.status}

@router.post("/{meeting_id}/start")
def start_meeting(meeting_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    meeting.status = "active"
    meeting.started_at = datetime.utcnow()
    db.commit()
    return {"message": "Meeting started", "id": str(meeting.id)}

@router.post("/{meeting_id}/end")
def end_meeting(meeting_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    meeting.status = "completed"
    meeting.ended_at = datetime.utcnow()
    db.commit()
    return {"message": "Meeting ended", "id": str(meeting.id)}

@router.post("/{meeting_id}/consent")
def give_consent(meeting_id: str, participant_email: str, db: Session = Depends(get_db)):
    consent = ConsentLog(
        meeting_id=meeting_id,
        participant_email=participant_email,
        consent_given=True,
        consented_at=datetime.utcnow()
    )
    db.add(consent)
    db.commit()
    return {"message": "Consent recorded", "email": participant_email}
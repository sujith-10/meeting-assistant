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
from services.email_service import send_meeting_summary
from services.ai_pipeline import extract_insights
from models.transcript import Transcript
from models.insight import Insight
from models.action_item import ActionItem

@router.delete("/{meeting_id}")
def delete_meeting(meeting_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id, Meeting.host_id == current_user.id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    db.delete(meeting)
    db.commit()
    return {"message": "Meeting deleted successfully"}

@router.post("/{meeting_id}/send-summary")
def send_summary(meeting_id: str, emails: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    # Get insights from database
    insights_db = db.query(Insight).filter(Insight.meeting_id == meeting_id).all()
    action_items_db = db.query(ActionItem).filter(ActionItem.meeting_id == meeting_id).all()

    if not insights_db and not action_items_db:
        raise HTTPException(status_code=404, detail="No insights found. Run /analyze first.")

    insights = {
        "summary": next((i.content for i in insights_db if i.type == "topic"), ""),
        "decisions": [i.content for i in insights_db if i.type == "decision"],
        "open_questions": [i.content for i in insights_db if i.type == "open_question"],
        "topics": [i.content for i in insights_db if i.type == "topic"],
        "action_items": [{"task": a.description, "assignee": a.assignee_email} for a in action_items_db]
    }

    to_emails = [e.strip() for e in emails.split(",")]
    result = send_meeting_summary(to_emails, meeting.title, insights)

    return {"message": "Summary email sent", "result": result}

from services.email_service import send_reminder_email

@router.post("/{meeting_id}/remind")
def send_reminder(meeting_id: str, email: str, task: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    result = send_reminder_email(email, task, meeting.title)
    return {"message": "Reminder sent", "result": result}

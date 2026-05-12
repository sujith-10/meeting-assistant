from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.insight import Insight
from models.action_item import ActionItem
from models.transcript import Transcript
from routers.auth import get_current_user
from models.user import User
from services.ai_pipeline import extract_insights
from datetime import datetime

router = APIRouter(prefix="/insights", tags=["insights"])

@router.post("/{meeting_id}/extract")
def extract_meeting_insights(
    meeting_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get all transcripts for this meeting
    transcripts = db.query(Transcript).filter(Transcript.meeting_id == meeting_id).all()
    if not transcripts:
        raise HTTPException(status_code=404, detail="No transcripts found for this meeting")

    # Combine all transcript text
    full_text = " ".join([t.text for t in transcripts])

    # Extract insights using Claude
    insights = extract_insights(full_text)

    # Save decisions
    for decision in insights.get("decisions", []):
        db.add(Insight(meeting_id=meeting_id, type="decision", content=decision))

    # Save open questions
    for question in insights.get("open_questions", []):
        db.add(Insight(meeting_id=meeting_id, type="open_question", content=question))

    # Save topics
    for topic in insights.get("topics", []):
        db.add(Insight(meeting_id=meeting_id, type="topic", content=topic))

    # Save action items
    for item in insights.get("action_items", []):
        db.add(ActionItem(
            meeting_id=meeting_id,
            description=item["task"],
            assignee_email=item.get("assignee"),
            completed=False
        ))

    db.commit()

    return {
        "summary": insights.get("summary"),
        "decisions": insights.get("decisions", []),
        "action_items": insights.get("action_items", []),
        "open_questions": insights.get("open_questions", []),
        "topics": insights.get("topics", [])
    }

@router.get("/{meeting_id}")
def get_insights(meeting_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    insights = db.query(Insight).filter(Insight.meeting_id == meeting_id).all()
    action_items = db.query(ActionItem).filter(ActionItem.meeting_id == meeting_id).all()
    return {
        "insights": [{"type": i.type, "content": i.content} for i in insights],
        "action_items": [{"description": a.description, "assignee": a.assignee_email, "completed": a.completed} for a in action_items]
    }
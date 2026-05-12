from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.action_item import ActionItem
from routers.auth import get_current_user
from models.user import User
from datetime import datetime

router = APIRouter(prefix="/action-items", tags=["action-items"])

@router.get("/")
def get_all_action_items(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    items = db.query(ActionItem).all()
    return [
        {
            "id": str(i.id),
            "meeting_id": str(i.meeting_id),
            "description": i.description,
            "assignee": i.assignee_email,
            "due_date": str(i.due_date) if i.due_date else None,
            "completed": i.completed
        } for i in items
    ]

@router.get("/{meeting_id}")
def get_meeting_action_items(meeting_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    items = db.query(ActionItem).filter(ActionItem.meeting_id == meeting_id).all()
    return [
        {
            "id": str(i.id),
            "description": i.description,
            "assignee": i.assignee_email,
            "due_date": str(i.due_date) if i.due_date else None,
            "completed": i.completed
        } for i in items
    ]

@router.patch("/{item_id}/complete")
def mark_complete(item_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.query(ActionItem).filter(ActionItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Action item not found")
    item.completed = True
    db.commit()
    return {"message": "Action item marked as complete", "id": item_id}

@router.patch("/{item_id}/due-date")
def set_due_date(item_id: str, due_date: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.query(ActionItem).filter(ActionItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Action item not found")
    item.due_date = datetime.strptime(due_date, "%Y-%m-%d")
    db.commit()
    return {"message": "Due date updated", "id": item_id, "due_date": due_date}

@router.delete("/{item_id}")
def delete_action_item(item_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.query(ActionItem).filter(ActionItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Action item not found")
    db.delete(item)
    db.commit()
    return {"message": "Action item deleted"}
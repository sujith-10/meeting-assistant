from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from database import Base

class ActionItem(Base):
    __tablename__ = "action_items"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    meeting_id = Column(UUID(as_uuid=True), ForeignKey("meetings.id"))
    description = Column(Text, nullable=False)
    assignee_email = Column(String, nullable=True)
    due_date = Column(DateTime, nullable=True)
    completed = Column(Boolean, default=False)
    external_task_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
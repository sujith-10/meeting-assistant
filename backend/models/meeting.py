from sqlalchemy import Column, String, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from database import Base

class Meeting(Base):
    __tablename__ = "meetings"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    host_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    status = Column(Enum("scheduled", "active", "completed", name="meeting_status"), default="scheduled")
    started_at = Column(DateTime, nullable=True)
    ended_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
from sqlalchemy import Column, Boolean, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from database import Base

class ConsentLog(Base):
    __tablename__ = "consent_logs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    meeting_id = Column(UUID(as_uuid=True), ForeignKey("meetings.id"))
    participant_email = Column(String, nullable=False)
    consent_given = Column(Boolean, default=False)
    consented_at = Column(DateTime, nullable=True)
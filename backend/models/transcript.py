from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from database import Base

class Transcript(Base):
    __tablename__ = "transcripts"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    meeting_id = Column(UUID(as_uuid=True), ForeignKey("meetings.id"))
    speaker_label = Column(String, nullable=True)
    speaker_name = Column(String, nullable=True)
    text = Column(Text, nullable=False)
    timestamp_start = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
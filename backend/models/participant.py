from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid
from database import Base

class Participant(Base):
    __tablename__ = "participants"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    meeting_id = Column(UUID(as_uuid=True), ForeignKey("meetings.id"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    email = Column(String, nullable=False)
    name = Column(String, nullable=True)
from sqlalchemy import Column, String, Enum, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid
from database import Base

class Insight(Base):
    __tablename__ = "insights"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    meeting_id = Column(UUID(as_uuid=True), ForeignKey("meetings.id"))
    type = Column(Enum("decision", "action_item", "open_question", "topic", name="insight_type"))
    content = Column(Text, nullable=False)
    assignee_email = Column(String, nullable=True)
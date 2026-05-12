from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.transcript import Transcript
from models.insight import Insight
from models.action_item import ActionItem
from models.meeting import Meeting
from routers.auth import get_current_user
from models.user import User
from services.transcription import transcribe_audio_file
from services.ai_pipeline import extract_insights, generate_summary_email
import shutil
import os

router = APIRouter(prefix='/transcripts', tags=['transcripts'])

@router.post('/{meeting_id}/upload')
def upload_and_transcribe(
    meeting_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail='Meeting not found')

    temp_path = f'temp_{file.filename}'
    with open(temp_path, 'wb') as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        result = transcribe_audio_file(temp_path)
        saved = []
        for utterance in result['speakers']:
            t = Transcript(
                meeting_id=meeting_id,
                speaker_label=utterance['speaker'],
                text=utterance['text'],
                timestamp_start=utterance['start']
            )
            db.add(t)
            saved.append({
                'speaker': utterance['speaker'],
                'text': utterance['text'],
                'start': utterance['start']
            })
        db.commit()
        return {'transcript': result['text'], 'utterances': saved}
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


@router.post('/{meeting_id}/analyze')
def analyze_transcript(
    meeting_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get all transcript text for this meeting
    transcripts = db.query(Transcript).filter(Transcript.meeting_id == meeting_id).all()
    if not transcripts:
        raise HTTPException(status_code=404, detail='No transcript found for this meeting')

    full_text = ' '.join([f"{t.speaker_label}: {t.text}" for t in transcripts])

    # Run Gemini AI analysis
    insights = extract_insights(full_text)

    # Save decisions and open questions as insights
    for decision in insights.get('decisions', []):
        db.add(Insight(meeting_id=meeting_id, type='decision', content=decision))

    for question in insights.get('open_questions', []):
        db.add(Insight(meeting_id=meeting_id, type='open_question', content=question))

    for topic in insights.get('topics', []):
        db.add(Insight(meeting_id=meeting_id, type='topic', content=topic))

    # Save action items separately
    for item in insights.get('action_items', []):
        db.add(ActionItem(
            meeting_id=meeting_id,
            description=item['task'],
            assignee_email=item.get('assignee', 'unknown')
        ))

    db.commit()

    return {
        'summary': insights.get('summary'),
        'decisions': insights.get('decisions'),
        'action_items': insights.get('action_items'),
        'open_questions': insights.get('open_questions'),
        'topics': insights.get('topics')
    }


@router.get('/{meeting_id}')
def get_transcript(
    meeting_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    transcripts = db.query(Transcript).filter(Transcript.meeting_id == meeting_id).all()
    return [{'speaker': t.speaker_label, 'text': t.text, 'start': t.timestamp_start} for t in transcripts]


@router.get('/{meeting_id}/insights')
def get_insights(
    meeting_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    insights = db.query(Insight).filter(Insight.meeting_id == meeting_id).all()
    action_items = db.query(ActionItem).filter(ActionItem.meeting_id == meeting_id).all()

    return {
        'decisions': [i.content for i in insights if i.type == 'decision'],
        'open_questions': [i.content for i in insights if i.type == 'open_question'],
        'topics': [i.content for i in insights if i.type == 'topic'],
        'action_items': [{'description': a.description, 'assignee': a.assignee_email, 'completed': a.completed} for a in action_items]
    }
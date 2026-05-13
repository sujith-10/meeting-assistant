from groq import Groq
import os
import json
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'))

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def extract_insights(transcript_text: str) -> dict:
    # Truncate to avoid rate limits
    transcript_text = transcript_text[:3000]
    
    prompt = f""" are an AI meeting analyst. Analyze this meeting transcript and extract structured insights.

Transcript:
{transcript_text}

Return ONLY a valid JSON object with this exact structure, no extra text:
{{
    "decisions": ["decision 1", "decision 2"],
    "action_items": [
        {{"task": "task description", "assignee": "person name or unknown", "due_date": null}}
    ],
    "open_questions": ["question 1", "question 2"],
    "topics": ["topic 1", "topic 2"],
    "summary": "A concise 3-5 sentence summary of the meeting"
}}
"""
    response = client.chat.completions.create(
       model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3
    )
    text = response.choices[0].message.content.strip()

    # Clean markdown if present
    if "```" in text:
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    text = text.strip()

    return json.loads(text)


def generate_summary_email(insights: dict, meeting_title: str) -> str:
    prompt = f"""
Create a professional post-meeting email summary for "{meeting_title}".

Insights:
{json.dumps(insights, indent=2)}

Write a clean, concise email that includes:
- Brief meeting overview
- Key decisions made
- Action items with assignees
- Open questions to resolve

Keep it under 300 words. Professional tone.
"""
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3
    )
    return response.choices[0].message.content.strip()
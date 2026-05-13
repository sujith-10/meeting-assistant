# 🎙️ MeetMind — Enterprise Meeting Intelligence Platform

A full-stack AI-powered meeting assistant that transcribes meetings, identifies speakers, extracts insights, and sends automated summaries.

## ✨ Features

- 🔐 User authentication with JWT tokens
- 🎙️ Audio transcription with speaker identification (AssemblyAI)
- 🤖 AI-powered insight extraction (decisions, action items, open questions, topics)
- 📧 Automated post-meeting email summaries (SendGrid)
- ✅ Action items tracker
- 📋 Participant consent management

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Python + FastAPI |
| Database | PostgreSQL |
| Transcription | AssemblyAI |
| AI Analysis | Groq (LLaMA 3.3 70B) |
| Email | SendGrid |
| Auth | JWT tokens |

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables
Create `backend/.env`:

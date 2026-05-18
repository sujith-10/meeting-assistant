from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from routers import auth, meetings, transcripts, insights, action_items, calendar

load_dotenv()

app = FastAPI(title="MeetMind API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(meetings.router)
app.include_router(transcripts.router)
app.include_router(insights.router)
app.include_router(action_items.router)
app.include_router(calendar.router)

@app.get("/")
def root():
    return {"status": "MeetMind API is running"}

@app.get("/health")
def health():
    return {"status": "ok"}
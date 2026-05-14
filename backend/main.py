from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from routers import auth, meetings, transcripts, insights, websocket, calendar


load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env'))

app = FastAPI(title='MeetMind API', version='1.0.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(auth.router)
app.include_router(meetings.router)
app.include_router(transcripts.router)
app.include_router(insights.router)
app.include_router(websocket.router)
app.include_router(calendar.router)

@app.get('/')
def root():
    return {'status': 'MeetMind API is running'}

@app.get('/health')
def health():
    return {'status': 'ok'}

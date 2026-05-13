import assemblyai as aai
import os
from dotenv import load_dotenv

load_dotenv()

aai.settings.api_key = os.getenv("ASSEMBLYAI_API_KEY")

def on_open(session_opened: aai.RealtimeSessionOpened):
    print("Session opened:", session_opened.session_id)

def on_error(error: aai.RealtimeError):
    print("Error:", error)

def on_close():
    print("Session closed")

def create_realtime_transcriber(on_data_callback):
    transcriber = aai.RealtimeTranscriber(
        on_data=on_data_callback,
        on_error=on_error,
        on_open=on_open,
        on_close=on_close,
        sample_rate=16000,
        encoding=aai.AudioEncoding.pcm_s16le
    )
    return transcriber

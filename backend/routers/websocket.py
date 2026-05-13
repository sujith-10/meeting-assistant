from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from database import SessionLocal
from models.transcript import Transcript
import os
from dotenv import load_dotenv
from deepgram import DeepgramClient, LiveTranscriptionEvents, LiveOptions

load_dotenv()

router = APIRouter()

@router.websocket("/ws/transcribe/{meeting_id}")
async def websocket_transcribe(websocket: WebSocket, meeting_id: str):
    await websocket.accept()
    db = SessionLocal()

    try:
        deepgram = DeepgramClient(os.getenv("DEEPGRAM_API_KEY"))
        dg_connection = deepgram.listen.asynclive.v("1")

        async def on_message(self, result, **kwargs):
            try:
                sentence = result.channel.alternatives[0].transcript
                if not sentence:
                    return
                is_final = result.is_final

                await websocket.send_json({
                    "type": "transcript",
                    "text": sentence,
                    "is_final": is_final,
                    "speaker": "A"
                })

                if is_final:
                    t = Transcript(
                        meeting_id=meeting_id,
                        speaker_label="A",
                        text=sentence,
                        timestamp_start=0.0
                    )
                    db.add(t)
                    db.commit()
            except Exception as e:
                print("Message error:", e)

        async def on_error(self, error, **kwargs):
            print("Deepgram error:", error)

        dg_connection.on(LiveTranscriptionEvents.Transcript, on_message)
        dg_connection.on(LiveTranscriptionEvents.Error, on_error)

        options = LiveOptions(
            model="nova-2",
            language="en-US",
            smart_format=True,
            interim_results=True,
        )

        await dg_connection.start(options)

        while True:
            data = await websocket.receive_bytes()
            await dg_connection.send(data)

    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print("WebSocket error:", e)
    finally:
        try:
            await dg_connection.finish()
        except:
            pass
        db.close()
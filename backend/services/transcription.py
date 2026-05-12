import assemblyai as aai
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'))

aai.settings.api_key = os.getenv('ASSEMBLYAI_API_KEY')

def transcribe_audio_file(file_path: str) -> dict:
    config = aai.TranscriptionConfig(
        speaker_labels=True,
        speech_models=['universal-2']
    )
    transcriber = aai.Transcriber()
    transcript = transcriber.transcribe(file_path, config=config)

    result = {
        'text': transcript.text,
        'speakers': []
    }

    if transcript.utterances:
        for utterance in transcript.utterances:
            result['speakers'].append({
                'speaker': utterance.speaker,
                'text': utterance.text,
                'start': utterance.start,
                'end': utterance.end
            })

    return result

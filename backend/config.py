from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
ASSEMBLYAI_API_KEY = os.getenv("ASSEMBLYAI_API_KEY")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
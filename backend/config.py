import os
from pathlib import Path


class Config:
    BASE_DIR = Path(__file__).resolve().parent
    PROJECT_ROOT = BASE_DIR.parent
    TEMP_DIR = PROJECT_ROOT / ".local" / "api_temp"
    WHISPER_MODEL = os.getenv("WHISPER_MODEL", "small")
    SUMMARIZER_MODEL = os.getenv("SUMMARIZER_MODEL", "sshleifer/distilbart-cnn-12-6")
    TRANSFORMER_DEVICE = int(os.getenv("TRANSFORMER_DEVICE", "-1"))
    ENABLE_DIARIZATION = os.getenv("ENABLE_DIARIZATION", "false").lower() == "true"
    MAX_CONTENT_LENGTH = 200 * 1024 * 1024

import os
from pathlib import Path


class Config:
    BASE_DIR = Path(__file__).resolve().parent
    PROJECT_ROOT = BASE_DIR.parent
    TEMP_DIR = PROJECT_ROOT / ".local" / "api_temp"
    # Use faster-whisper base model for better accuracy.
    # Base is ~74MB, 2-3x faster than regular whisper, excellent accuracy.
    # (Tiny had too many hallucinations - "Thank you" when user said "hello")
    WHISPER_MODEL = os.getenv("WHISPER_MODEL", "base")
    SUMMARIZER_MODEL = os.getenv("SUMMARIZER_MODEL", "sshleifer/distilbart-cnn-12-6")
    OLLAMA_MODEL_NAME = os.getenv("OLLAMA_MODEL_NAME", "gemma3:latest")
    OLLAMA_TIMEOUT = int(os.getenv("OLLAMA_TIMEOUT", "120"))
    OLLAMA_WARMUP = os.getenv("OLLAMA_WARMUP", "true").lower() == "true"
    TRANSFORMER_DEVICE = int(os.getenv("TRANSFORMER_DEVICE", "-1"))
    ENABLE_DIARIZATION = os.getenv("ENABLE_DIARIZATION", "false").lower() == "true"
    MAX_CONTENT_LENGTH = 200 * 1024 * 1024

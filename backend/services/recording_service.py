"""
Meeting recording and transcription service.
Handles live recording, real-time transcription, and transcript editing.
"""
import os
import json
import tempfile
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime


class RecordingService:
    """Service for managing live audio recordings and transcriptions."""

    def __init__(self):
        self.recordings_dir = Path(tempfile.gettempdir()) / "meeting_recordings"
        self.recordings_dir.mkdir(parents=True, exist_ok=True)

    def create_recording_session(self) -> Dict:
        """
        Create a new recording session.
        
        Returns:
            Session data with ID and metadata
        """
        session_id = datetime.now().strftime("%Y%m%d_%H%M%S")
        session_data = {
            "session_id": session_id,
            "created_at": datetime.now().isoformat(),
            "transcript": {
                "full_text": "",
                "segments": [],
                "edited_text": "",
            },
            "status": "recording",
        }
        return session_data

    def save_transcription(
        self,
        session_id: str,
        transcript: Dict,
        edited_text: Optional[str] = None,
    ) -> Dict:
        """
        Save transcription for a recording session.
        
        Args:
            session_id: Unique session identifier
            transcript: Transcription data (text, segments)
            edited_text: Optional edited version of transcript
        
        Returns:
            Session data with saved transcription
        """
        session_file = self.recordings_dir / f"{session_id}_transcript.json"
        
        session_data = {
            "session_id": session_id,
            "created_at": datetime.now().isoformat(),
            "transcript": {
                "full_text": transcript.get("text", ""),
                "segments": transcript.get("segments", []),
                "edited_text": edited_text or "",
                "language": transcript.get("language"),
            },
            "status": "completed",
        }
        
        with open(session_file, "w", encoding="utf-8") as f:
            json.dump(session_data, f, ensure_ascii=False, indent=2)
        
        return session_data

    def edit_transcription(self, session_id: str, edited_text: str) -> Dict:
        """
        Update transcription text for a session.
        
        Args:
            session_id: Session identifier
            edited_text: Edited transcript text
        
        Returns:
            Updated session data
        """
        session_file = self.recordings_dir / f"{session_id}_transcript.json"
        
        if session_file.exists():
            with open(session_file, "r", encoding="utf-8") as f:
                session_data = json.load(f)
        else:
            session_data = {
                "session_id": session_id,
                "transcript": {"edited_text": ""},
            }
        
        session_data["transcript"]["edited_text"] = edited_text
        session_data["last_edited"] = datetime.now().isoformat()
        
        with open(session_file, "w", encoding="utf-8") as f:
            json.dump(session_data, f, ensure_ascii=False, indent=2)
        
        return session_data

    def get_transcription(self, session_id: str) -> Optional[Dict]:
        """
        Retrieve transcription for a session.
        
        Args:
            session_id: Session identifier
        
        Returns:
            Session data or None if not found
        """
        session_file = self.recordings_dir / f"{session_id}_transcript.json"
        
        if session_file.exists():
            with open(session_file, "r", encoding="utf-8") as f:
                return json.load(f)
        
        return None

    def list_sessions(self) -> List[Dict]:
        """
        List all recorded sessions.
        
        Returns:
            List of session metadata
        """
        sessions = []
        for json_file in sorted(self.recordings_dir.glob("*_transcript.json")):
            try:
                with open(json_file, "r", encoding="utf-8") as f:
                    session_data = json.load(f)
                    sessions.append({
                        "session_id": session_data.get("session_id"),
                        "created_at": session_data.get("created_at"),
                        "text": session_data.get("transcript", {}).get("full_text", "")[:100],
                    })
            except Exception as e:
                print(f"Error reading session {json_file}: {e}")
        
        return sessions

from io import BytesIO

from flask import Blueprint, request, send_file

from backend.services.meeting_service import MeetingService
from backend.services.recording_service import RecordingService
from backend.utils.http import error, success

api = Blueprint("api", __name__)
meeting_service = MeetingService()
recording_service = RecordingService()


@api.get("/health")
def health():
    return success({"status": "healthy"}, "Backend is running.")


@api.post("/transcribe")
def transcribe():
    audio_file = request.files.get("audio")
    if not audio_file:
        return error("Audio file is required under the 'audio' field.", 400)

    try:
        language = request.form.get("language")
        payload = meeting_service.transcribe_audio_file(audio_file, language=language)
        return success(payload, "Audio transcribed successfully.")
    except Exception as exc:
        return error("Failed to transcribe audio.", 500, str(exc))


@api.post("/summarize")
def summarize():
    body = request.get_json(silent=True) or {}
    text = body.get("text", "")
    if not text.strip():
        return error("Text is required in the request body.", 400)

    try:
        payload = meeting_service.summarize_text(text)
        return success(payload, "Text summarized successfully.")
    except Exception as exc:
        return error("Failed to summarize text.", 500, str(exc))


@api.post("/process")
def process():
    try:
        if "audio" in request.files:
            language = request.form.get("language")
            payload = meeting_service.process_audio_file(request.files["audio"], language=language)
            return success(payload, "Audio processed successfully.")

        if "document" in request.files:
            payload = meeting_service.process_document_file(request.files["document"])
            return success(payload, "Document processed successfully.")

        body = request.get_json(silent=True) or {}
        text = body.get("text", "")
        if not text.strip():
            return error("Provide either an audio file or a text payload.", 400)

        payload = meeting_service.summarize_text(text)
        return success(payload, "Text processed successfully.")
    except Exception as exc:
        return error("Failed to process meeting content.", 500, str(exc))


@api.post("/export/<export_format>")
def export_minutes(export_format):
    body = request.get_json(silent=True) or {}
    meeting_data = body.get("meeting_data")
    if not isinstance(meeting_data, dict):
        return error("meeting_data must be provided in the request body.", 400)

    try:
        file_buffer, mimetype, filename = meeting_service.export_minutes(meeting_data, export_format)
        output = BytesIO(file_buffer.getvalue())
        output.seek(0)
        return send_file(output, mimetype=mimetype, as_attachment=True, download_name=filename)
    except Exception as exc:
        return error("Failed to export meeting minutes.", 500, str(exc))


@api.post("/email")
def send_email():
    body = request.get_json(silent=True) or {}
    meeting_data = body.get("meeting_data")
    recipients = body.get("recipients", [])
    subject = body.get("subject")
    email_body = body.get("body")
    attach_pdf = bool(body.get("attach_pdf", True))
    attach_docx = bool(body.get("attach_docx", False))

    if not isinstance(meeting_data, dict):
        return error("meeting_data must be provided in the request body.", 400)
    if not isinstance(recipients, list) or not recipients:
        return error("At least one recipient email is required.", 400)

    try:
        meeting_service.send_email(
            meeting_data=meeting_data,
            recipients=recipients,
            subject=subject,
            body=email_body,
            attach_pdf=attach_pdf,
            attach_docx=attach_docx,
        )
        return success({}, "Email sent successfully.")
    except Exception as exc:
        return error("Failed to send email.", 500, str(exc))


# ==================== RECORDING & TRANSCRIPTION ENDPOINTS ====================

@api.post("/recording/start")
def start_recording_session():
    """
    Start a new recording session.
    Returns session_id for tracking the recording.
    """
    try:
        session_data = recording_service.create_recording_session()
        return success(
            {"session_id": session_data["session_id"]},
            "Recording session started."
        )
    except Exception as exc:
        return error("Failed to start recording session.", 500, str(exc))


@api.post("/recording/transcribe")
def record_and_transcribe():
    """
    Receive audio data and transcribe using faster-whisper.
    Supports chunked/streaming transcription or direct upload.
    
    Expects:
    - audio: Binary audio file (WAV, MP3, etc.)
    - session_id: Session identifier (optional, for tracking)
    - language: Language code (optional, for auto-detect use None)
    """
    audio_file = request.files.get("audio")
    if not audio_file:
        return error("Audio file is required under the 'audio' field.", 400)

    try:
        session_id = request.form.get("session_id", "unknown")
        language = request.form.get("language")
        
        print(f"[DEBUG] Received audio file: {audio_file.filename}, size: {len(audio_file.read())} bytes")
        audio_file.seek(0)  # Reset file pointer after reading size
        
        # Transcribe audio
        transcript = meeting_service.transcribe_audio_file(audio_file, language=language)
        
        # Save to recording session
        if session_id != "unknown":
            recording_service.save_transcription(session_id, transcript)
        
        # Return transcript for immediate editing
        return success(
            {
                "session_id": session_id,
                "transcript": transcript,
            },
            "Audio transcribed successfully. Edit transcript before summarizing."
        )
    except Exception as exc:
        import traceback
        print(f"❌ [ERROR] Transcription failed: {str(exc)}")
        print(f"[TRACEBACK] {traceback.format_exc()}")
        return error("Failed to transcribe recording.", 500, str(exc))


@api.post("/recording/edit")
def edit_transcript():
    """
    Update transcription text before summarization.
    
    Expects:
    - session_id: Session identifier
    - edited_text: Edited transcript text
    """
    body = request.get_json(silent=True) or {}
    session_id = body.get("session_id")
    edited_text = body.get("edited_text", "")
    
    if not session_id:
        return error("session_id is required.", 400)
    if not edited_text.strip():
        return error("edited_text is required.", 400)

    try:
        updated_session = recording_service.edit_transcription(session_id, edited_text)
        return success(
            updated_session,
            "Transcript updated successfully."
        )
    except Exception as exc:
        return error("Failed to update transcript.", 500, str(exc))


@api.get("/recording/<session_id>")
def get_recording_session(session_id):
    """
    Retrieve transcription data for a recording session.
    """
    try:
        session_data = recording_service.get_transcription(session_id)
        if session_data:
            return success(session_data, "Session data retrieved.")
        else:
            return error("Session not found.", 404)
    except Exception as exc:
        return error("Failed to retrieve session.", 500, str(exc))


@api.get("/recording/list/all")
def list_recording_sessions():
    """
    List all recorded sessions with metadata.
    """
    try:
        sessions = recording_service.list_sessions()
        return success(
            {"sessions": sessions},
            f"Found {len(sessions)} recording sessions."
        )
    except Exception as exc:
        return error("Failed to list sessions.", 500, str(exc))

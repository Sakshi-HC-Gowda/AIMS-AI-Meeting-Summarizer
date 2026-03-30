from io import BytesIO

from flask import Blueprint, request, send_file

from backend.services.meeting_service import MeetingService
from backend.utils.http import error, success

api = Blueprint("api", __name__)
meeting_service = MeetingService()


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

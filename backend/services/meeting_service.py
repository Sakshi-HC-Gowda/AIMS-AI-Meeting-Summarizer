import os
import re
import tempfile
from pathlib import Path
from typing import Dict, List, Optional

import PyPDF2
import pdfplumber
from werkzeug.datastructures import FileStorage
from werkzeug.utils import secure_filename

from backend.config import Config

PROJECT_ROOT = Config.PROJECT_ROOT
if str(PROJECT_ROOT) not in os.sys.path:
    os.sys.path.insert(0, str(PROJECT_ROOT))

from audio_processing.diarize import diarize_audio
from audio_processing.transcribe import transcribe_with_whisper
from audio_processing.transcript_parser import (
    has_timestamp_format,
    parse_transcript_with_timestamps,
)
from email_utils import send_summary_email
from export_utils import MeetingExporter
from summarizer.bart_summarizer import (
    build_topic_bullets_from_chunks,
    merge_bullet_summaries,
    merge_summaries_text,
    summarize_chunks_bart,
    summarize_global,
)
from summarizer.structure_formatter import (
    build_structure,
    extract_decisions_and_actions,
)
from summarizer.summarize import chunk_transcript


def sanitize_summary_text(text: str) -> str:
    if not text:
        return ""
    cleaned = re.sub(r"[\u2580-\u259F\u2500-\u257F\u25A0-\u25FF]+", "-", text)
    cleaned = re.sub(r"-\s*-+", "----", cleaned)
    cleaned = re.sub(r"^-{5,}$", "----", cleaned, flags=re.MULTILINE)
    return cleaned.strip()


def normalize_structured_data(structured: Dict) -> Dict:
    if not structured:
        return structured

    structured["agenda"] = [
        {"title": item.get("title", "").strip()}
        for item in structured.get("agenda", [])
        if isinstance(item, dict) and item.get("title", "").strip()
    ]

    decisions = []
    seen_decisions = set()
    for item in structured.get("decisions", []):
        text = str(item).strip()
        if not text:
            continue
        key = text.lower()
        if key in seen_decisions:
            continue
        seen_decisions.add(key)
        decisions.append(text)
    structured["decisions"] = decisions

    cleaned_actions = []
    seen_tasks = set()
    for item in structured.get("action_items", []):
        if not isinstance(item, dict):
            continue
        task = str(item.get("task", "")).strip()
        if not task:
            continue
        key = task.lower()
        if key in seen_tasks:
            continue
        seen_tasks.add(key)
        cleaned_actions.append(
            {
                "task": task,
                "responsible": str(item.get("responsible", "")).strip(),
                "deadline": str(item.get("deadline", "")).strip(),
                "status": str(item.get("status", "Pending")).strip() or "Pending",
            }
        )
    structured["action_items"] = cleaned_actions
    structured["summary"] = sanitize_summary_text(structured.get("summary", ""))
    return structured


class MeetingService:
    def __init__(self):
        self.temp_dir = Path(Config.TEMP_DIR)
        self.temp_dir.mkdir(parents=True, exist_ok=True)
        self.exporter = MeetingExporter(header_image_path=str(PROJECT_ROOT / "college_header.jpg"))

    def _save_upload(self, file: FileStorage) -> Path:
        suffix = Path(file.filename or "audio.wav").suffix or ".wav"
        safe_name = secure_filename(Path(file.filename or "meeting-audio").stem) or "meeting-audio"
        temp_file = tempfile.NamedTemporaryFile(
            delete=False,
            dir=self.temp_dir,
            prefix=f"{safe_name}-",
            suffix=suffix,
        )
        file.save(temp_file.name)
        temp_file.close()
        return Path(temp_file.name)

    def _extract_text_from_pdf(self, file_path: Path) -> str:
        text = ""
        try:
            with pdfplumber.open(str(file_path)) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
        except Exception:
            with open(file_path, "rb") as pdf_handle:
                reader = PyPDF2.PdfReader(pdf_handle)
                for page in reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
        return text.strip()

    def extract_text_from_document(self, file: FileStorage) -> Dict:
        file_path = self._save_upload(file)
        suffix = file_path.suffix.lower()

        if suffix == ".txt":
            text = file_path.read_text(encoding="utf-8", errors="ignore").strip()
        elif suffix == ".pdf":
            text = self._extract_text_from_pdf(file_path)
        else:
            raise ValueError("Unsupported document type. Use TXT or PDF.")

        if not text:
            raise ValueError("No text could be extracted from the uploaded document.")

        return {
            "document_filename": file.filename,
            "document_path": str(file_path),
            "text": text,
        }

    def transcribe_audio_file(self, file: FileStorage, language: Optional[str] = None) -> Dict:
        audio_path = self._save_upload(file)
        transcript = transcribe_with_whisper(
            str(audio_path),
            model_name=Config.WHISPER_MODEL,
            language=language,
        )
        if transcript.get("error"):
            raise RuntimeError(transcript["error"])

        return {
            "audio_filename": file.filename,
            "audio_path": str(audio_path),
            "transcript": transcript.get("text", "").strip(),
            "segments": transcript.get("segments", []),
        }

    def _segments_from_text(self, text: str) -> Dict[str, List[Dict]]:
        transcript_text = (text or "").strip()
        if not transcript_text:
            raise ValueError("Text is required for summarization.")

        if has_timestamp_format(transcript_text):
            segments = parse_transcript_with_timestamps(transcript_text)
            full_text = "\n".join(
                [f"{seg.get('speaker', 'Speaker')}: {seg.get('text', '')}" for seg in segments]
            )
            if not segments:
                segments = [{"speaker": "Speaker 1", "start": 0, "end": 0, "text": transcript_text}]
                full_text = transcript_text
        else:
            segments = [{"speaker": "Speaker 1", "start": 0, "end": 0, "text": transcript_text}]
            full_text = transcript_text

        return {"segments": segments, "full_text": full_text}

    def summarize_text(self, text: str) -> Dict:
        parsed = self._segments_from_text(text)
        segments = parsed["segments"]
        full_text = parsed["full_text"]

        chunks = chunk_transcript(segments, max_chars=2200)
        chunk_summaries = summarize_chunks_bart(
            chunks,
            model_name=Config.SUMMARIZER_MODEL,
            device=Config.TRANSFORMER_DEVICE,
        )
        merged_text = merge_summaries_text(chunk_summaries)
        topic_summary = build_topic_bullets_from_chunks(chunk_summaries)
        global_summary = summarize_global(
            merged_text,
            model_name=Config.SUMMARIZER_MODEL,
            device=Config.TRANSFORMER_DEVICE,
        )

        final_summary = merge_bullet_summaries(topic_summary, global_summary) if topic_summary else global_summary
        final_summary = sanitize_summary_text(final_summary)

        structured = build_structure(segments, final_summary, full_text)
        decisions, action_items = extract_decisions_and_actions(full_text)
        if decisions:
            structured["decisions"] = decisions
        if action_items:
            structured["action_items"] = action_items
        structured = normalize_structured_data(structured)

        return {
            "transcript": full_text,
            "summary": final_summary,
            "structured_summary": structured,
            "chunk_count": len(chunks),
        }

    def process_audio_file(self, file: FileStorage, language: Optional[str] = None) -> Dict:
        transcription = self.transcribe_audio_file(file, language=language)
        segments = transcription.get("segments", [])
        full_text = transcription.get("transcript", "")

        if Config.ENABLE_DIARIZATION and segments:
            try:
                diarized = diarize_audio(
                    transcription["audio_path"],
                    segments,
                    use_pyannote=False,
                )
                if diarized:
                    segments = diarized
                    full_text = "\n".join(
                        [f"{seg.get('speaker', 'Speaker')}: {seg.get('text', '')}" for seg in diarized]
                    )
            except Exception:
                pass

        summary_payload = self.summarize_text(full_text if full_text else transcription.get("transcript", ""))
        summary_payload["audio_filename"] = transcription["audio_filename"]
        summary_payload["segments"] = segments
        return summary_payload

    def process_document_file(self, file: FileStorage) -> Dict:
        extracted = self.extract_text_from_document(file)
        summary_payload = self.summarize_text(extracted["text"])
        summary_payload["document_filename"] = extracted["document_filename"]
        return summary_payload

    def export_minutes(self, meeting_data: Dict, export_format: str):
        export_format = export_format.lower()
        if export_format == "pdf":
            return self.exporter.export_to_pdf(meeting_data), "application/pdf", "meeting-minutes.pdf"
        if export_format == "docx":
            return (
                self.exporter.export_to_docx(meeting_data),
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "meeting-minutes.docx",
            )
        raise ValueError("Unsupported export format. Use 'pdf' or 'docx'.")

    def build_email_body(self, meeting_data: Dict) -> str:
        summary = meeting_data.get("summary", "") or ""
        decisions = meeting_data.get("decisions", []) or []
        action_items = meeting_data.get("action_items", []) or []
        lines = ["Meeting Summary", ""]

        if summary:
            lines.append(summary)
            lines.append("")

        if decisions:
            lines.append("Key Decisions")
            for decision in decisions:
                lines.append(f"- {decision}")
            lines.append("")

        if action_items:
            lines.append("Action Items")
            for item in action_items:
                task = item.get("task", "")
                responsible = item.get("responsible", "")
                deadline = item.get("deadline", "")
                suffix = []
                if responsible:
                    suffix.append(f"Owner: {responsible}")
                if deadline:
                    suffix.append(f"Deadline: {deadline}")
                detail = f" ({', '.join(suffix)})" if suffix else ""
                lines.append(f"- {task}{detail}")

        return "\n".join(lines).strip()

    def send_email(
        self,
        meeting_data: Dict,
        recipients: List[str],
        subject: Optional[str] = None,
        body: Optional[str] = None,
        attach_pdf: bool = True,
        attach_docx: bool = False,
    ) -> None:
        pdf_buffer = self.exporter.export_to_pdf(meeting_data) if attach_pdf else None
        docx_buffer = self.exporter.export_to_docx(meeting_data) if attach_docx else None
        send_summary_email(
            subject=subject or "AIMS Meeting Minutes",
            body=body or self.build_email_body(meeting_data),
            recipients=recipients,
            pdf_buffer=pdf_buffer,
            docx_buffer=docx_buffer,
        )

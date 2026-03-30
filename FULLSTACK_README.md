# AIMS Full-Stack Upgrade

This repo now includes a Flask backend and a React frontend while keeping the existing Whisper and BART processing flow.

## Folder structure

```text
MeetingMinutesAI/
|-- backend/
|   |-- api/
|   |-- services/
|   |-- utils/
|   |-- app.py
|   `-- requirements.txt
|-- frontend/
|   |-- public/
|   |-- src/
|   |-- package.json
|   `-- tailwind.config.js
|-- audio_processing/
|-- summarizer/
|-- export_utils.py
`-- app.py
```

## Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

The Flask API runs at `http://localhost:5000`.

### Endpoints

- `POST /api/transcribe`
- `POST /api/summarize`
- `POST /api/process`
- `POST /api/export/pdf`
- `POST /api/export/docx`
- `POST /api/email`

## Frontend

```bash
cd frontend
npm install
npm run dev
```

The React app runs at `http://localhost:5173`.

## Request examples

### Summarize text

```json
{
  "text": "Your meeting transcript"
}
```

### Transcribe audio

Send multipart form-data with the file under `audio`.

### Full processing

Use either:

- multipart form-data with `audio`
- multipart form-data with `document` for TXT or PDF
- JSON with `text`

### Send email

Send JSON with:

```json
{
  "meeting_data": {},
  "recipients": ["team@example.com"],
  "subject": "AIMS Meeting Minutes",
  "body": "Optional custom body",
  "attach_pdf": true,
  "attach_docx": false
}
```

## Notes

- The backend reuses the current modules from `audio_processing/`, `summarizer/`, and `export_utils.py`.
- Set `ENABLE_DIARIZATION=true` if you want the backend to apply the existing diarization fallback.
- The export endpoints accept the `structured_summary` object returned by `/api/process` or `/api/summarize`.
- Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and `SMTP_SENDER` before using the email step.

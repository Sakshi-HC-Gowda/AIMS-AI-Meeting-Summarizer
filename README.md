# AIMS Full-Stack Upgrade

This repo now includes a Flask backend and a React frontend with enhanced features including **audio upload, live recording, offline AI summarization using Ollama, and editable transcripts**.

---

## Features

*  **Live Recording**

  * Record audio directly in the app
  * Instant transcription and editing

*  **Audio Upload with Instant Transcription**

  * Upload audio → transcription happens immediately
  * Transcript displayed and editable on the same page

*  **Offline Summarization (Ollama)**

  * Uses local LLM (TinyLlama recommended)
  * No internet required after setup

*  **Editable Workflow**

  * Edit transcript before generating summary

---

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
|   |-- components/
|   |-- package.json
|   `-- tailwind.config.js
|-- audio_processing/
|-- summarizer/
|-- export_utils.py
`-- app.py
```

---

## Ollama Setup (IMPORTANT – Required for Offline Summarization)

### Step 1: Start Ollama

```bash
ollama serve
```

👉 This must be running **before starting backend**

---

### Step 2: Install lightweight model (Recommended for 8GB RAM)

```bash
ollama pull tinyllama
```

---

### Step 3: Preload model (IMPORTANT)

```bash
ollama run tinyllama
```

Wait for response → then press `Ctrl + C`

👉 This avoids timeout issues

---

## Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

The Flask API runs at `http://localhost:5000`.

---

## Frontend

```bash
cd frontend
npm install
npm run dev
```

The React app runs at `http://localhost:5173`.

---

## Endpoints

* `POST /api/recording/transcribe`  ← 🎤 Used for live recording + audio upload
* `POST /api/summarize`
* `POST /api/process`
* `POST /api/export/pdf`
* `POST /api/export/docx`
* `POST /api/email`

---

## Request examples

### Summarize text

```json
{
  "text": "Your meeting transcript"
}
```

---

### Transcribe audio

Send multipart form-data with the file under:

```text
audio
```

---

### Full processing

Use either:

* multipart form-data with `audio`
* multipart form-data with `document` for TXT or PDF
* JSON with `text`

---

### Send email

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

---

##  Workflow

### Live Recording

1. Record audio
2. Transcription happens instantly
3. Edit transcript
4. Generate summary

---

### Audio Upload

1. Upload audio file
2. Transcription happens immediately
3. Edit transcript
4. Generate summary

---

### Text / PDF

1. Upload or paste content
2. Process via pipeline
3. Generate summary

---

## Notes

* The backend reuses modules from `audio_processing/`, `summarizer/`, and `export_utils.py`
* Set `ENABLE_DIARIZATION=true` for speaker separation fallback
* Ollama must be running (`ollama serve`) before backend
* Recommended model: `tinyllama` (for 8GB RAM systems)
* Avoid using heavy models like `gemma3` on low RAM systems

---

## ⚠️ Troubleshooting

### Ollama timeout

* Ensure `ollama serve` is running
* Preload model (`ollama run tinyllama`)
* Increase timeout in summarizer

---

### Slow performance

* Close unused applications
* Reduce token size
* Use lightweight models

---

##  Offline Capability

✔ No internet required after model download
✔ All processing happens locally
✔ Full data privacy

---

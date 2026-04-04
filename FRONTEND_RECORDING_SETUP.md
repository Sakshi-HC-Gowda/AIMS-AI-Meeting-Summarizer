# 🎙️ Frontend Recording Feature - Setup & Testing Guide

## What's New

Your React frontend now has a **Live Recording** option built directly into the Upload Source page!

### New Tab Added
In the "Upload Source" section, you'll see a new tab:
- **Live Recording** 🎙️ (NEW!) - Record meetings directly from your browser
- Audio Upload - Upload pre-recorded audio
- Paste Text - Paste transcript text
- TXT File - Upload text documents
- PDF File - Upload PDF documents

---

## Setup Instructions

### 1. Backend Server (Required)
The recording feature requires the backend API to be running.

```bash
# Terminal 1: Start the backend
cd backend
python app.py
```

This starts the server at `http://localhost:5000`

### 2. Frontend Development Server
```bash
# Terminal 2: Start the frontend
cd frontend
npm run dev
```

This starts the frontend at `http://localhost:5173` (or similar)

### 3. Verify Both Are Running
- Backend: http://localhost:5000/api/health → Should show `{"status": "healthy"}`
- Frontend: http://localhost:5173 → Should load the UI

---

## How to Use the Recording Feature

### Step 1: Navigate to Upload Source
1. Open the app at http://localhost:5173
2. Click **"Upload Source"** in the sidebar
3. You should see tabs at the top, including **"Live Recording"** (with mic icon)

### Step 2: Start Recording
1. Click the **"Live Recording"** tab
2. Click **"Start Recording"** button (red)
3. **Speak into your microphone** - the timer will count up
4. When done speaking, click **"Stop Recording"**

### Step 3: View Transcription
After stopping:
- The system will **automatically transcribe** your recording
- You'll see a loading indicator: "Using faster-whisper..."
- After 10-30 seconds, your **transcript appears**

### Step 4: Edit (Optional)
1. The transcript appears in a box
2. You can copy it, or
3. **If you want to edit**: Click into the "Pasted Text" tab and paste/edit there
4. Then proceed to summarization as usual

### Step 5: Summarize
Once you have the transcript (recorded or edited):
1. Go to **"Processing Pipeline"**
2. Or directly to **"Output"**
3. The existing pipeline will process it normally

---

## Troubleshooting

### Issue: "Microphone access denied"
**Solution:**
1. Allow browser to access microphone when prompted
2. Check browser permissions (Chrome → Settings → Privacy → Microphone)
3. Ensure microphone works in other apps

### Issue: "Transcription error" or "Backend connection failed"
**Solution:**
```bash
# Check backend is running
curl http://localhost:5000/api/health

# If not running, restart:
cd backend
python app.py
```

### Issue: Recording tab doesn't appear
**Solution:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Refresh page (Ctrl+R)
3. Make sure App.jsx was updated with recording option

### Issue: Slow Transcription
**Solution:**
- First transcription might be slow (model loading)
- Subsequent transcriptions will be faster
- Typical: 10-30 seconds for a 1-minute recording

### Issue: "localhost:5000 not reachable"
**Solution:**
- Ensure backend is running on port 5000
- Check if port 5000 is blocked:
  ```bash
  netstat -ano | findstr :5000
  ```
- If in use, change port in backend/app.py and update frontend fetch URL

---

## Architecture

```
┌──────────────────────────────────────────────┐
│         Your Browser (Frontend)              │
├──────────────────────────────────────────────┤
│  ┌────────────────────────────────────────┐  │
│  │  Upload Source Page (React)            │  │
│  │  ┌─ Audio Upload                       │  │
│  │  ├─ Paste Text                         │  │
│  │  ├─ TXT File                           │  │
│  │  ├─ PDF File                           │  │
│  │  └─ 🎙️ Live Recording (NEW!)          │  │
│  │     ├─ Start/Stop Button               │  │
│  │     ├─ Timer (MM:SS)                   │  │
│  │     └─ Transcript Display              │  │
│  └──────────┬──────────────────────────────┘  │
│             │ (sends audio blob)              │
│             ↓                                  │
│  HTTP POST /api/recording/transcribe         │
└──────────────────────────────────────────────┘
             ↓
┌──────────────────────────────────────────────┐
│         Backend (Python/Flask)               │
├──────────────────────────────────────────────┤
│  /api/recording/transcribe                   │
│  └─ Receives audio blob                      │
│     ├─ Saves to temp file                    │
│     ├─ Loads faster-whisper model            │
│     ├─ Transcribes offline                   │
│     └─ Returns text + segments               │
│                                              │
│  Returns: {text, segments, language}         │
└──────────────────────────────────────────────┘
            ↓
   Transcript sent back to frontend
             ↓
   User sees it in UI and can:
   - Copy
   - Edit
   - Proceed to summarization
```

---

## Files Modified/Created

### New React Component
- `frontend/src/components/RecordingStep.jsx` - Recording UI with controls

### Updated Files
- `frontend/src/App.jsx` - Added Mic icon import, added "record" to inputMethods
- `frontend/src/components/UploadSourcePage.jsx` - Added RecordingStep component

### Backend (Already Updated)
- `/api/recording/transcribe` endpoint handles transcription

---

## Complete End-to-End Test

```bash
# Terminal 1: Start Backend
cd backend
python app.py
# Output: Running on http://0.0.0.0:5000

# Terminal 2: Start Frontend  
cd frontend
npm run dev
# Output: http://localhost:5173

# Browser:
1. Open http://localhost:5173
2. Click "Upload Source" in sidebar
3. Click "Live Recording" tab
4. Click "Start Recording"
5. Say: "Hello, this is a test recording. Today we discussed project deadlines and agreed on Q2 targets."
6. Click "Stop Recording"
7. Wait 15-30 seconds for transcription
8. See transcript appear!
9. Now you can summarize or edit

```

---

## Next Steps

### For Users
1. Record your meetings using the new Live Recording tab
2. Review the auto-generated transcript
3. Edit if needed
4. Summarize using the existing pipeline
5. Export/share as before

### For Development
- Modify `RecordingStep.jsx` to customize the UI
- Add error handling as needed
- Integrate with your existing state management
- Consider adding features like:
  - Download transcript as TXT/JSON
  - Pause/Resume recording
  - Audio level indicator
  - Speaker diarization (identify different speakers)

---

## Performance Notes

| Action | Duration |
|--------|----------|
| 10-sec recording | ~3-5 seconds transcription |
| 1-min recording | ~10-15 seconds transcription |
| 5-min recording | ~30-50 seconds transcription |
| First run | +10-20s (model download) |

**Why?** faster-whisper is 5x faster than OpenAI's Whisper, all processing happens locally.

---

## Questions?

- **Recording not starting?** Check microphone permissions
- **Transcription failing?** Ensure backend is running on port 5000
- **Slow transcription?** That's normal - check duration above
- **Need changes?** Edit `RecordingStep.jsx` or backend routes

Enjoy your new recording feature! 🎉

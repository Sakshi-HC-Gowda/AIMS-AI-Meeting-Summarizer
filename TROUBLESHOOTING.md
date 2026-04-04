# 🐛 Recording Feature - Troubleshooting & Error Solutions

## Common Errors & Fixes

### Error 1: "🔌 Cannot reach backend at http://localhost:5000"

**Problem:** Frontend cannot connect to the backend server.

**Causes:**
1. Backend is not running
2. Wrong port
3. CORS issues
4. Backend crashed

**Solutions:**

```bash
# Step 1: Check if backend is running
curl http://localhost:5000/api/health

# If you see connection refused, start the backend:
cd backend
python app.py

# Look for output like:
# WARNING:werkzeug:Running on http://0.0.0.0:5000
# WARNING:werkzeug:Note: This is a development server...

# Step 2: If port 5000 is already in use
netstat -ano | findstr :5000
# Kill the process:
taskkill /PID <PID> /F

# Step 3: Check dependencies are installed
pip install -r requirements.txt

# Step 4: Verify faster-whisper is installed
python -c "import faster_whisper; print('✅ faster-whisper installed')"

# If it fails, install it:
pip install faster-whisper
```

---

### Error 2: "⏱️ Request timeout - backend took too long"

**Problem:** Transcription takes more than 2 minutes.

**Causes:**
1. Recording is too long
2. Backend is slow (first run downloading model)
3. CPU is maxed out
4. Insufficient RAM

**Solutions:**

```bash
# Step 1: Try a shorter recording (30 seconds instead of 5 minutes)

# Step 2: Check if faster-whisper model is cached
ls ~/.cache/huggingface/hub/

# First run: Model downloads (~140MB) - takes 30-60 seconds extra
# Subsequent runs: Should be instant

# Step 3: Check system resources
# Windows Task Manager:
# - Right-click taskbar → Task Manager
# - Look at CPU and Memory usage
# - If CPU < 20%, something is wrong
# - If RAM > 80%, close other apps

# Step 4: Try smaller model (faster)
# Edit backend to use "tiny" instead of "base":
# In backend/api/routes.py, look for:
#   transcript = meeting_service.transcribe_audio_file(audio_file, language=language)
# It uses "base" by default, which is fine. But if needed:
#   transcript = meeting_service.transcribe_audio_file(audio_file, model="tiny", language=language)
```

---

### Error 3: "🌐 Network error. Check your internet connection"

**Problem:** Network-level error during transcription.

**Causes:**
1. Firewall blocking connection
2. Network adapter issue
3. Local network problem

**Solutions:**

```bash
# Step 1: Test local connection
ping localhost
ping 127.0.0.1

# Step 2: Check firewall on Windows
# Settings → Privacy & Security → Windows Defender Firewall
# → Allow an app through firewall
# → Make sure Python is allowed

# Step 3: Try accessing backend directly
# Open browser and go to: http://localhost:5000/api/health
# Should show: {"status": "healthy"}

# Step 4: Restart network services
ipconfig /all
ipconfig /renew
```

---

### Error 4: Empty Transcript ("Transcription resulted in empty text")

**Problem:** Recording completed but produced no text.

**Causes:**
1. Background noise too loud
2. Microphone not working properly
3. Audio file corrupted
4. Language not recognized

**Solutions:**

```bash
# Step 1: Check microphone
# Windows Settings → Sound → Volume mixer
# Make sure your microphone is:
#   - Not muted
#   - Showing volume levels when speaking
#   - Selected as default

# Step 2: Test in another app
# Use Windows Voice Recorder to test microphone

# Step 3: Try recording in quiet environment
# Background noise > 60dB affects recognition

# Step 4: Check browser microphone permissions
# Chrome: Click camera/mic icon → Manage
# Edge: Settings → Privacy → Microphone → Manage
# Firefox: Preferences → Privacy → Microphone → Manage

# Step 5: Try a different recording
# Record 30+ seconds of clear speech
```

---

### Error 5: Microphone Access Error

**Problem:** "Microphone access denied"

**Causes:**
1. Browser doesn't have microphone permission
2. OS-level microphone access blocked
3. Microphone hardware issue

**Solutions:**

```bash
# Step 1: Grant browser microphone access
# When you click "Start Recording", browser will ask
# Click "Allow" to grant permission

# Step 2: Check Windows privacy settings
# Settings → Privacy & Security → Microphone
# Make sure it's ON and apps can access it

# Step 3: Check individual app permissions
# Settings → Privacy & Security → Microphone → Manage
# Make sure your browser (Chrome/Edge/Firefox) is listed and enabled

# Step 4: Test microphone
# Settings → Sound → Volume mixer
# Speak and watch the volume meter move

# Step 5: Reinstall audio drivers
# Device Manager → Audio inputs and outputs
# Right-click your microphone → Update driver
```

---

## Diagnostic Checklist

Before reporting a bug, check these:

### Backend Checklist
- [ ] Run `python app.py` in backend folder
- [ ] See "Running on http://0.0.0.0:5000" message
- [ ] No errors or exceptions shown
- [ ] Run `curl http://localhost:5000/api/health` returns healthy status
- [ ] Run `pip install -r requirements.txt` successfully
- [ ] faster-whisper installed: `pip install faster-whisper`

### Frontend Checklist
- [ ] Run `npm run dev` in frontend folder
- [ ] Open http://localhost:5173
- [ ] See "Upload Source" in sidebar
- [ ] See "Live Recording" tab with mic icon
- [ ] No errors in browser console (F12)
- [ ] Green checkmark shows "Backend connected" (in RecordingStep)

### Microphone Checklist
- [ ] Microphone is not muted (Windows volume mixer)
- [ ] Browser has microphone permission (Settings)
- [ ] Speaks when testing, volume meter shows activity
- [ ] Works in other apps (Discord, Skype, etc.)

### Recording Checklist
- [ ] Click "Start Recording" → Button turns to "Stop Recording"
- [ ] Timer counts up
- [ ] Speak clearly and audibly
- [ ] Click "Stop Recording"
- [ ] Progress bar appears (5% → 100%)
- [ ] See transcript appear

---

## Progress Tracking Explanation

The recording feature now shows **live percentage** of the transcription:

```
5%    = Uploading audio to server
15%   = Processing audio file
50%   = Starting transcription with faster-whisper
75%   = Processing transcription results
95%   = Finalizing transcript
100%  = Complete!
```

Each stage has a status message explaining what's happening.

---

## Debug Mode: Check Browser Console

Press **F12** to open Developer Tools → Console tab

You'll see logs like:
```javascript
🎙️ Audio Recording Info: {size: "245.33 KB", type: "audio/webm", duration: "60s", sessionId: "recording_1712160842123"}

📡 Sending to backend: http://localhost:5000/api/recording/transcribe

✅ Backend Response Status: 200

📊 Backend Full Response: {success: true, message: "...", data: {...}}

✨ Transcription Complete: {length: 2847, words: 412}
```

If you see errors here, it helps debug:
- `❌ Backend Error Response:` - Backend returned an error
- `❌ Could not parse error response:` - Response format issue
- `❌ Transcription Error:` - Detailed error info

---

## System Requirements Check

```bash
# Check Python version (need 3.8+)
python --version

# Check pip
pip --version

# Check installed packages
pip list | findstr faster-whisper
pip list | findstr pyaudio

# Check Node version
node --version

# Check npm
npm --version

# Check available RAM
wmic OS get TotalVisibleMemorySize,FreePhysicalMemory

# Check CPU info
wmic cpu get name
```

---

## If Nothing Works: Nuclear Options

**Option 1: Fresh Install**
```bash
# Delete virtual environment and reinstall
cd backend
python -m venv venv_new
venv_new\Scripts\activate
pip install -r requirements.txt
python app.py
```

**Option 2: Clear Cache**
```bash
# Delete faster-whisper model cache
rmdir /s %USERPROFILE%\.cache\huggingface\hub

# Clear npm cache
cd frontend
npm cache clean --force

# Reinstall node_modules
rmdir /s node_modules
npm install
npm run dev
```

**Option 3: Use Docker (if available)**
```bash
# Run backend in isolated container
docker build -t aims-backend .
docker run -p 5000:5000 aims-backend

# Frontend still runs locally
cd frontend && npm run dev
```

---

## Performance Optimization

If transcription is slow:

```bash
# Check if you're using optimal model
# In backend/api/routes.py, the default is "base" (74M)
# Options:
#   "tiny"   - 39M  (3-4s per minute)     ← Use this if slow
#   "base"   - 74M  (5-6s per minute)     ← Current default
#   "small"  - 244M (10-12s per minute)   ← Better quality
#   "medium" - 769M (20-30s per minute)
#   "large"  - 1.5B (40-60s per minute)

# Use GPU acceleration (if available)
# Install CUDA toolkit
# Then change in code:
#   model = WhisperModel("base", device="cuda", ...)
# instead of device="cpu"
```

---

## Still Having Issues?

**Collect this info and share:**
1. Error message from browser console (F12)
2. Error message from backend terminal
3. Output of: `python --version`, `pip list`, `node --version`, `npm --version`
4. Browser type and version
5. Operating system
6. Steps to reproduce

**Create an issue with:**
```markdown
## Bug Report
- **Error:** [exact error message]
- **When:** [at what step]
- **Backend:** [running/not running] Version: [python --version]
- **Frontend:** [running/not running] Version: [node --version]
- **Browser:** [Chrome/Edge/Firefox] Version: [version]
- **OS:** Windows/Mac/Linux Version: [version]

## Steps to Reproduce
1. ...
2. ...
3. ...

## Expected vs Actual
Expected: ...
Actual: ...

## Debug Output
[Copy logs from console and terminal]
```

---

## Quick Links

- **Backend Logs**: See all backend errors/info
- **Frontend Console**: F12 → Console tab
- **Backend Health**: http://localhost:5000/api/health
- **Faster-Whisper Docs**: https://github.com/SYSTRAN/faster-whisper
- **Flask Docs**: https://flask.palletsprojects.com/

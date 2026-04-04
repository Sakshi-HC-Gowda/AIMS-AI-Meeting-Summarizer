# Ollama Setup Guide for Offline Summarization

This document explains how to set up and run **Ollama with Gemma 3 model** for offline meeting summarization.

## What is Ollama?

Ollama is a lightweight tool that runs large language models (LLMs) locally on your computer. This enables **100% offline** text summarization without cloud dependencies.

## Installation

### Step 1: Download Ollama

- **Windows**: Download from [ollama.ai](https://ollama.ai)
- **macOS**: Download from [ollama.ai](https://ollama.ai)
- **Linux**: Follow the Linux instructions at [ollama.ai](https://ollama.ai)

### Step 2: Install Ollama

Run the installer and complete the installation. Ollama will usually be installed at:
- **Windows**: `C:\Users\{username}\AppData\Local\Programs\Ollama`

### Step 3: Start Ollama Service

**Option A: GUI (Recommended)**
- On Windows, Ollama runs in the system tray after installation
- Click the Ollama icon to see status

**Option B: Command Line**

```bash
# Windows
ollama serve

# macOS / Linux
ollama serve
```

Keep this terminal open - the Ollama service needs to be running for summarization to work.

## Step 4: Pull the Gemma 3 Model

Open a **new terminal** (leave the `ollama serve` terminal running) and run:

```bash
ollama pull gemma3
```

This will download the Gemma 3 model (~12GB). First run takes time, but it's cached locally after download.

**Show available models:**
```bash
ollama list
```

You should see `gemma3` in the list.

## Step 5: Verify Installation

Test if Ollama is working:

```bash
# This should return a JSON response with "response" field
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemma3",
    "prompt": "What is 2+2?",
    "stream": false
  }'
```

If you get a response without errors, Ollama is working correctly!

## Step 6: Start Using the App

Once Ollama is running with Gemma 3:

1. **Start the backend:**
   ```bash
   cd backend
   python app.py
   ```

2. **Start the frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Upload a meeting recording/transcript** - The app will now use **offline Ollama summarization**

## Troubleshooting

### ❌ Error: "Cannot connect to Ollama at http://localhost:11434"

**Solution:**
- Ensure Ollama is running: `ollama serve` should be active in a terminal
- Check firewall settings - allow Ollama on port 11434
- Try restarting Ollama service

### ❌ Error: "gemma3 model not found"

**Solution:**
- Pull the model: `ollama pull gemma3`
- Verify it downloaded: `ollama list`
- Wait for download to complete (it's large, ~12GB)

### ❌ Summarization is very slow

**Possible causes:**
- First request downloads the model into memory (~2-3 minutes)
- Your CPU is in use elsewhere
- System RAM is low (Gemma 3 needs 8GB+ RAM)

**Solution:**
- Close other applications
- Restart Ollama: Stop `ollama serve` (Ctrl+C) and start again
- Smaller model alternative: Try `ollama pull mistral` (smaller, faster)

### ❌ Ollama crashes after a while

**Solution:**
- Restart the Ollama service
- Check available RAM: Close unused applications
- Reduce number of concurrent requests

## Configuration

### Change Model

To use a different model instead of Gemma 3:

1. Pull the model:
   ```bash
   ollama pull mistral    # or any other model
   ```

2. Edit `summarizer/ollama_summarizer.py`:
   ```python
   MODEL_NAME = "mistral"  # Change from "gemma3" to your model
   ```

3. Restart the app

### Recommended Models

- **Gemma 3** (Default, ~12GB) - Balanced quality/speed
- **Mistral** (~5GB) - Smaller, faster, good for summarization
- **Llama 2** (~7GB) - Good quality
- **Neural Chat** (~3GB) - Small but reasonable

### Performance Tuning

Edit `summarizer/ollama_summarizer.py`:

```python
# Increase timeout if responses are slow
TIMEOUT = 180  # Seconds (default 120)

# Adjust temperature for consistency vs creativity
"temperature": 0.1  # Lower = more consistent, Higher = more creative
```

## Offline Use Confirmation

✅ **The summarization is now 100% offline:**
- No internet connection needed after initial model download
- No cloud API calls
- All processing happens locally on your machine
- Complete privacy - data never leaves your computer

## Next Steps

1. Start `ollama serve` in a terminal
2. Start the application (backend + frontend)
3. Upload a meeting recording - it will use offline Ollama summarization!

For issues or more info: Check [ollama.ai documentation](https://ollama.ai)

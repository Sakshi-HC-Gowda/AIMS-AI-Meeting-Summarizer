import React, { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, RotateCcw, Upload, AlertCircle, Loader, CheckCircle, Zap } from "lucide-react";

// Utility function to convert AudioBuffer to WAV format
function audioBufferToWav(buffer) {
  const length = buffer.length;
  const sampleRate = buffer.sampleRate;
  const numChannels = buffer.numberOfChannels;
  const bytesPerSample = 2; // 16-bit
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = length * blockAlign;
  const bufferSize = 44 + dataSize;

  const arrayBuffer = new ArrayBuffer(bufferSize);
  const view = new DataView(arrayBuffer);

  // WAV header
  const writeString = (offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, bufferSize - 8, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size
  view.setUint16(20, 1, true); // AudioFormat (PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // BitsPerSample
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  // PCM data
  let offset = 44;
  for (let i = 0; i < length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
      view.setInt16(offset, sample * 0x7FFF, true);
      offset += 2;
    }
  }

  return arrayBuffer;
}

export default function RecordingStep({ onTranscriptReady, onRecordingFile }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedTime, setRecordedTime] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [editableTranscript, setEditableTranscript] = useState("");
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribingProgress, setTranscribingProgress] = useState(0);
  const [error, setError] = useState("");
  const [recordingSessionId, setRecordingSessionId] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [customDuration, setCustomDuration] = useState(120); // Default 2 minutes
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const timerInterval = useRef(null);
  const streamRef = useRef(null);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Start recording with high-quality audio settings
  const startRecording = async () => {
    try {
      setError("");
      setTranscript("");

      // Request high-quality audio with noise suppression
      const constraints = {
        audio: {
          sampleRate: 44100, // High sample rate for better quality
          channelCount: 1, // Mono for better processing
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          volume: 1.0,
        }
      };

      console.log("🎙️ Requesting microphone access with high-quality settings...");
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Use high-quality audio format
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/wav'
      ];

      let mimeType = 'audio/webm';
      for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          break;
        }
      }

      console.log(`🎵 Using audio format: ${mimeType}`);

      // Create MediaRecorder with high quality settings
      const options = {
        mimeType: mimeType,
        audioBitsPerSecond: 128000, // High bitrate
      };

      mediaRecorder.current = new MediaRecorder(stream, options);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.onstop = () => {
        console.log(`🎵 Recording stopped. Processing ${audioChunks.current.length} audio chunks...`);
        const audioBlob = new Blob(audioChunks.current, { type: mimeType });
        handleAudioRecorded(audioBlob);
      };

      // Start recording with smaller time slices for better quality
      mediaRecorder.current.start(100); // 100ms chunks
      setIsRecording(true);
      setRecordedTime(0);

      // Start timer
      timerInterval.current = setInterval(() => {
        setRecordedTime((prev) => {
          const newTime = prev + 1;
          // Auto-stop after custom duration
          if (newTime >= customDuration) {
            stopRecording();
          }
          return newTime;
        });
      }, 1000);

      console.log(`🎙️ Recording started for ${customDuration} seconds with high quality settings`);

    } catch (err) {
      console.error("❌ Microphone access error:", err);
      setError(`Microphone access denied: ${err.message}. Please check your microphone permissions and try again.`);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      clearInterval(timerInterval.current);

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    }
  };

  // Handle recorded audio
  const handleAudioRecorded = async (audioBlob) => {
    try {
      setIsTranscribing(true);
      setTranscribingProgress(5);
      setError("");
      setStatusMessage("📤 Uploading raw audio to backend (no preprocessing)...");

      // Create a session ID for tracking
      const sessionId = `recording_${Date.now()}`;
      setRecordingSessionId(sessionId);

      console.log("🎙️ Audio Recording Info:", {
        size: `${(audioBlob.size / 1024).toFixed(2)} KB`,
        type: audioBlob.type,
        duration: `${recordedTime}s`,
        sessionId: sessionId,
      });

      // Validate audio blob
      if (audioBlob.size < 1000) {
        throw new Error("Audio recording is too small. Please record for at least 2 seconds.");
      }

      // Send raw recorded audio directly to backend
      const formData = new FormData();
      
      // Convert audio blob to proper formats
      // Note: webm doesn't work well with faster-whisper, so we send webm as-is and let backend handle it
      // But we'll use the blob directly with proper mime type detection
      let audioToSend = audioBlob;
      let filename = "recording.wav";
      
      if (audioBlob.type.includes("webm")) {
        filename = "recording.webm";
        audioToSend = audioBlob;
      } else if (audioBlob.type.includes("mp4")) {
        filename = "recording.m4a";
        audioToSend = audioBlob;
      } else if (audioBlob.type.includes("wav")) {
        filename = "recording.wav";
        audioToSend = audioBlob;
      }
      
      formData.append("audio", audioToSend, filename);
      formData.append("session_id", sessionId);
      formData.append("language", "en");

      setTranscribingProgress(15);
      setStatusMessage("Processing audio on backend...");

      // Send to backend for transcription with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 240000); // 4 minute timeout for longer 2-minute audio processing

      console.log("📡 Sending to backend: http://localhost:5000/api/recording/transcribe");

      const response = await fetch("http://localhost:5000/api/recording/transcribe", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      setTranscribingProgress(50);
      setStatusMessage("🔄 Transcribing offline (faster-whisper tiny)...");

      console.log("✅ Backend Response Status:", response.status);

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        let errorMessage = `Server error: ${response.status} ${response.statusText}`;
        
        try {
          if (contentType?.includes("application/json")) {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
            console.error("❌ Backend Error Response:", errorData);
          } else {
            const text = await response.text();
            console.error("❌ Backend Error Text:", text);
            errorMessage = text || errorMessage;
          }
        } catch (parseErr) {
          console.error("❌ Could not parse error response:", parseErr);
        }

        throw new Error(errorMessage);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        throw new Error("Backend returned invalid response format (not JSON)");
      }

      setTranscribingProgress(75);
      const data = await response.json();

      console.log("Backend Full Response:", data);

      // Handle successful response
      if (!data.success) {
        throw new Error(data.message || "Transcription failed - server returned error");
      }

      // Support multiple payload formats:
      // - data.data.transcript.text (model-level output)
      // - data.data.transcript.transcript (MeetingService output)
      // - data.data.transcript as direct string
      let transcriptText = "";
      if (data.data?.transcript?.text) {
        transcriptText = data.data.transcript.text;
      } else if (data.data?.transcript?.transcript) {
        transcriptText = data.data.transcript.transcript;
      } else if (typeof data.data?.transcript === "string") {
        transcriptText = data.data.transcript;
      }

      transcriptText = transcriptText.trim();

      if (!transcriptText) {
        console.warn("⚠️ Empty transcript received:", data.data);
        setError("⚠️ No speech detected. Ensure you speak clearly and try again.");
        setTranscribingProgress(95);
        setStatusMessage("No transcript text generated.");
        setTranscript("");
        setEditableTranscript("");
        onTranscriptReady("");
        return;
      }

      setTranscribingProgress(95);
      setStatusMessage("Processing complete...");

      setTranscript(transcriptText);
      setEditableTranscript(transcriptText);
      setIsEditingTranscript(false);
      setTranscribingProgress(100);
      setStatusMessage("Transcription successful!");

      // Clear status message after 2 seconds
      setTimeout(() => setStatusMessage(""), 2000);

      onTranscriptReady(transcriptText);

      // Also pass the audio file for potential further processing
      onRecordingFile?.({
        file: audioBlob,
        sessionId: sessionId,
        transcript: transcriptText,
      });

      console.log("✨ Transcription Complete:", {
        length: transcriptText.length,
        words: transcriptText.split(/\s+/).length,
      });
    } catch (err) {
      const errorMsg = err.message || "Unknown error occurred";
      console.error("❌ Transcription Error:", {
        message: errorMsg,
        name: err.name,
        stack: err.stack,
      });

      setTranscribingProgress(0);

      // Provide helpful error messages
      if (err.name === "AbortError") {
        setError("⏱️ Request timeout - backend took too long. Try a shorter recording or restart the backend.");
      } else if (errorMsg.includes("Failed to fetch")) {
        setError("🔌 Cannot reach backend at http://localhost:5000. Is the backend running? (Run: python app.py in backend/)");
      } else if (errorMsg.includes("Network")) {
        setError("🌐 Network error. Check your internet connection and that the backend is accessible.");
      } else if (errorMsg.includes("No speech detected")) {
        setError(
          "🎙️ No speech detected, or audio was too short/quiet. Please speak clearly and try a 10+ second recording."
        );
      } else {
        setError(`❌ ${errorMsg}`);
      }

      setStatusMessage("");
    } finally {
      setIsTranscribing(false);
    }
  };

  // Check backend health
  const [backendHealthy, setBackendHealthy] = useState(null);

  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/health", {
          method: "GET",
        });
        if (response.ok) {
          const data = await response.json();
          setBackendHealthy(true);
        } else {
          setBackendHealthy(false);
        }
      } catch (err) {
        setBackendHealthy(false);
        console.warn("⚠️ Backend health check failed:", err.message);
      }
    };

    checkBackendHealth();
    // Check every 10 seconds
    const interval = setInterval(checkBackendHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  // Reset recording
  const resetRecording = () => {
    setTranscript("");
    setEditableTranscript("");
    setIsEditingTranscript(false);
    setRecordedTime(0);
    setError("");
    setRecordingSessionId(null);
    audioChunks.current = [];
  };

  // Save edited transcript (inline edit mode)
  const saveEditedTranscript = async () => {
    const text = editableTranscript.trim();
    if (!text) {
      setError("Transcript edit cannot be empty.");
      return;
    }
    setTranscript(text);
    setIsEditingTranscript(false);
    setStatusMessage("Transcript updated locally.");
    onTranscriptReady(text);

    if (recordingSessionId) {
      try {
        await fetch("http://localhost:5000/api/recording/edit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: recordingSessionId, edited_text: text }),
        });
      } catch (err) {
        console.warn("⚠️ Could not save edited transcript to backend:", err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Backend Health Status */}
      {backendHealthy === false && (
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-orange-900">⚠️ Backend Not Connected</p>
            <p className="text-sm text-orange-700 mt-1">
              The recording feature requires the backend server to be running.
            </p>
            <p className="text-xs text-orange-600 mt-2 font-mono">
              🚀 Start the backend: <code className="bg-orange-100 px-2 py-1 rounded">cd backend && python app.py</code>
            </p>
          </div>
        </div>
      )}
      {backendHealthy === true && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-3 flex gap-2 items-center">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
          <p className="text-sm font-medium text-green-800">✅ Backend connected and ready</p>
        </div>
      )}

      {/* Recording Status */}
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-full ${
                isRecording
                  ? "animate-pulse bg-red-100"
                  : "bg-slate-100"
              }`}
            >
              <Mic
                size={32}
                className={isRecording ? "text-red-600" : "text-slate-600"}
              />
            </div>
            <div>
              <p className="text-sm text-slate-600">
                {isRecording ? "Recording..." : "Ready to Record"}
              </p>
              <p className="text-3xl font-bold text-slate-900">
                {formatTime(recordedTime)}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {!isRecording && recordedTime === 0 ? (
              <button
                onClick={startRecording}
                className="flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 font-medium text-white hover:bg-red-700 transition"
              >
                <Mic size={18} />
                Start Recording
              </button>
            ) : isRecording ? (
              <button
                onClick={stopRecording}
                className="flex items-center gap-2 rounded-full bg-slate-600 px-6 py-3 font-medium text-white hover:bg-slate-700 transition"
              >
                <Square size={18} />
                Stop Recording
              </button>
            ) : null}

            {recordedTime > 0 && !isRecording && (
              <button
                onClick={resetRecording}
                className="flex items-center gap-2 rounded-full border border-slate-300 px-6 py-3 font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                <RotateCcw size={18} />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Recording info */}
        <p className="mt-4 text-xs text-slate-500">
          💡 Speak clearly into your microphone. Recording is processed offline using
          faster-whisper for fast, accurate transcription.
        </p>
      </div>

      {/* Error Message with Troubleshooting */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-red-900">Error During Transcription</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            
            <div className="mt-3 pt-3 border-t border-red-200">
              <p className="text-xs font-semibold text-red-900 mb-2">🔧 Troubleshooting:</p>
              <ul className="text-xs text-red-700 space-y-1">
                <li>✓ Check that the backend is running: <code className="bg-red-100 px-2 py-1 rounded">python app.py</code></li>
                <li>✓ Verify backend is on port 5000: <code className="bg-red-100 px-2 py-1 rounded">http://localhost:5000/api/health</code></li>
                <li>✓ Try recording a shorter audio sample (30 seconds)</li>
                <li>✓ Check browser console (F12) for detailed error logs</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Transcribing Status with Progress */}
      {isTranscribing && (
        <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 flex gap-4">
          <Loader className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5 animate-spin" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold text-blue-900">Transcribing...</p>
              <span className="text-lg font-bold text-blue-600">{transcribingProgress}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${transcribingProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-blue-700 mt-3 font-medium">
              {statusMessage || "Using faster-whisper for real-time transcription..."}
            </p>
            <p className="text-xs text-blue-600 mt-2">
              💡 This typically takes 10-30 seconds depending on recording length.
            </p>
          </div>
        </div>
      )}

      {/* Transcript Display with Success Indicator */}
      {transcript && (
        <div className="rounded-3xl border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-green-900">✅ Transcription Complete!</h3>
              <p className="text-xs text-green-700 mt-0.5">
                {(transcript.split(/\s+/).length)} words • Recording length: {recordedTime}s
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 max-h-72 overflow-y-auto shadow-sm">
            <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-medium">
              {transcript}
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Session ID: <code className="bg-slate-100 px-2 py-1 rounded">{recordingSessionId}</code>
            </p>
            <button
              onClick={resetRecording}
              className="text-xs px-3 py-1 rounded-full bg-green-600 text-white hover:bg-green-700 transition font-medium"
            >
              Record Again
            </button>
          </div>
        </div>
      )}

      {/* Transcript Editing */}
      {transcript && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-sm font-semibold text-blue-900">✏️ Edit Transcript</p>
            <button
              onClick={() => {
                setIsEditingTranscript(prev => !prev);
                setEditableTranscript(transcript);
              }}
              className="text-xs px-2 py-1 rounded-full border border-blue-300 text-blue-700 hover:bg-blue-100 transition"
            >
              {isEditingTranscript ? "Close Editor" : "Edit"}
            </button>
          </div>

          {isEditingTranscript ? (
            <div className="space-y-2">
              <textarea
                value={editableTranscript}
                onChange={(e) => setEditableTranscript(e.target.value)}
                rows={5}
                className="w-full rounded-lg border border-slate-300 p-2 text-sm text-slate-900"
              />
              <div className="flex gap-2">
                <button
                  onClick={saveEditedTranscript}
                  className="rounded-full bg-blue-600 px-4 py-2 text-white text-xs font-medium hover:bg-blue-700 transition"
                >
                  Save Transcript Edit
                </button>
                <button
                  onClick={() => setIsEditingTranscript(false)}
                  className="rounded-full border border-blue-300 px-4 py-2 text-blue-700 text-xs font-medium hover:bg-blue-100 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-blue-700">
              Tip: Use Edit to make manual corrections before summarizing.
            </p>
          )}
        </div>
      )}

      {/* Next Steps */}
      {transcript && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-900">
            ✨ Next: Review and process your transcription
          </p>
          <p className="text-xs text-amber-700 mt-1">
            The transcription is ready. Proceed to summarization with the final text.
          </p>
        </div>
      )}
    </div>
  );
}

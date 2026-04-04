import json
import os
import io
from pathlib import Path
import tempfile
from typing import Dict, List, Optional, Tuple
import numpy as np
import wave

def _save_json(obj, path):
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(obj, fh, ensure_ascii=False, indent=2)

_MODEL_CACHE = {}

def _download_vosk_model(model_name: str):
    model_map = {
        "vosk-model-en-us-0.22": "https://alphacephei.com/vosk/models/vosk-model-en-us-0.22.zip",
        "vosk-model-small-en-us-0.15": "https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip",
        "vosk-model-en-us-0.22-lgraph": "https://alphacephei.com/vosk/models/vosk-model-en-us-0.22-lgraph.zip",
    }

    if model_name not in model_map:
        raise Exception(
            f"Unknown Vosk model '{model_name}'. Supported models: {', '.join(model_map.keys())}."
        )

    url = model_map[model_name]
    target_dir = os.path.join(os.path.expanduser("~"), ".vosk", model_name)
    os.makedirs(os.path.dirname(target_dir), exist_ok=True)

    archive_path = os.path.join(tempfile.gettempdir(), f"{model_name}.zip")
    print(f"[INFO] Downloading Vosk model from {url} to {archive_path}...")
    try:
        import urllib.request
        urllib.request.urlretrieve(url, archive_path)
    except Exception as e:
        raise Exception(
            f"Failed to download Vosk model from {url}. Please download manually and place in {target_dir}. Error: {e}"
        )

    import shutil
    try:
        shutil.unpack_archive(archive_path, os.path.dirname(target_dir))
    except Exception as e:
        raise Exception(f"Failed to extract Vosk model archive: {e}")

    if not os.path.exists(target_dir):
        raise Exception(
            f"Downloaded model not found at {target_dir}. Please verify the archive content and model name."
        )


def _load_vosk_model(model_name: str = "vosk-model-en-us-0.22"):
    """
    Load Vosk model and cache it for reuse.
    """
    model_aliases = {
        "small": "vosk-model-small-en-us-0.15",
        "base": "vosk-model-en-us-0.22",
        "default": "vosk-model-en-us-0.22",
        "vosk-small": "vosk-model-small-en-us-0.15",
    }
    model_name = model_aliases.get(model_name, model_name)

    if model_name in _MODEL_CACHE:
        return _MODEL_CACHE[model_name]

    try:
        from vosk import Model
    except ImportError:
        raise Exception("vosk not installed. Install: pip install vosk")

    model_path = os.path.join(os.path.expanduser("~"), ".vosk", model_name)
    if not os.path.exists(model_path):
        print(f"[INFO] Vosk model {model_name} not found, attempting auto-download...")
        try:
            _download_vosk_model(model_name)
        except Exception as download_exc:
            print(f"[WARN] Could not auto-download {model_name}: {download_exc}")

    if not os.path.exists(model_path):
        if model_name != "vosk-model-small-en-us-0.15":
            print("[WARN] Fallback to vosk-model-small-en-us-0.15 because primary model is unavailable.")
            model_name = "vosk-model-small-en-us-0.15"
            model_path = os.path.join(os.path.expanduser("~"), ".vosk", model_name)

        if not os.path.exists(model_path):
            raise Exception(
                f"Vosk model {model_name} not found at {model_path}. Please download it from https://alphacephei.com/vosk/models"
            )

    print(f"[INFO] Loading Vosk model: {model_name}")
    model = Model(model_path)
    _MODEL_CACHE[model_name] = model
    return model

def _load_faster_whisper_model(model_name: str = "base", device: str = "cpu"):
    """
    Load faster-whisper model and cache it for reuse for better performance.

    Models available:
    - tiny: ~39M params, fastest
    - base: ~74M params, balanced
    - small: ~244M params
    - medium: ~769M params
    - large: ~1.55B params
    """
    cache_key = f"{model_name}:{device}"
    if cache_key in _MODEL_CACHE:
        return _MODEL_CACHE[cache_key]

    try:
        from faster_whisper import WhisperModel
    except ImportError:
        raise Exception("faster-whisper not installed. Install: pip install faster-whisper")

    print(f"[INFO] Loading faster-whisper model: {model_name}")
    model = WhisperModel(model_name, device=device, compute_type="int8")
    _MODEL_CACHE[cache_key] = model
    return model


def _transcribe_with_vosk(file_path, model_name="vosk-model-en-us-0.22", language=None, out_json=None):
    try:
        from vosk import KaldiRecognizer
        import json

        model = _load_vosk_model(model_name)

        # Open audio file
        wf = wave.open(file_path, "rb")
        if wf.getnchannels() != 1 or wf.getsampwidth() != 2 or wf.getcomptype() != "NONE":
            print("[INFO] Converting audio to 16kHz mono 16-bit PCM")
            # Convert audio if needed
            import audioop
            if wf.getnchannels() == 2:
                # Convert stereo to mono
                data = wf.readframes(wf.getnframes())
                data = audioop.tomono(data, wf.getsampwidth(), 0.5, 0.5)
            else:
                data = wf.readframes(wf.getnframes())

            # Convert sample rate to 16kHz if needed
            if wf.getframerate() != 16000:
                data, _ = audioop.ratecv(data, wf.getsampwidth(), 1, wf.getframerate(), 16000, None)

            # Ensure 16-bit
            if wf.getsampwidth() != 2:
                data = audioop.lin2lin(data, wf.getsampwidth(), 2)

            wf.close()

            # Create new wave file in memory
            import io
            wf = wave.Wave_read(io.BytesIO(data))
            wf.rewind()
            wf = wave.open(io.BytesIO(data), "rb")

        rec = KaldiRecognizer(model, wf.getframerate())
        rec.SetWords(True)  # Enable word timestamps

        segments = []
        full_text = ""

        print(f"[INFO] Transcribing {Path(file_path).name} with Vosk...")

        while True:
            data = wf.readframes(4000)
            if len(data) == 0:
                break
            if rec.AcceptWaveform(data):
                result = json.loads(rec.Result())
                if 'result' in result:
                    for word in result['result']:
                        segments.append({
                            'start': word['start'],
                            'end': word['end'],
                            'text': word['word']
                        })
                        full_text += word['word'] + " "

        # Get final result
        final_result = json.loads(rec.FinalResult())
        if 'result' in final_result:
            for word in final_result['result']:
                segments.append({
                    'start': word['start'],
                    'end': word['end'],
                    'text': word['word']
                })
                full_text += word['word'] + " "

        full_text = full_text.strip()
        word_count = len(full_text.split())

        print(f"[INFO] Vosk transcription complete. Words: {word_count}")

        transcript = {
            "text": full_text,
            "segments": segments,
            "language": "en",
            "language_probability": None,
        }

    except Exception as e:
        print(f"❌ Error during transcription: {str(e)}")
        transcript = {"text": "", "segments": [], "error": str(e)}

    if out_json:
        _save_json(transcript, out_json)
    return transcript


def _transcribe_with_faster_whisper(file_path, model_name="base", language=None, out_json=None):
    try:
        model = _load_faster_whisper_model(model_name, device="cpu")

        print(f"[INFO] Transcribing {Path(file_path).name} with faster-whisper {model_name}...")
        segments, info = model.transcribe(
            file_path,
            language=language,
            beam_size=1,
            best_of=1,
            temperature=0.0,
            word_timestamps=False,
        )

        segments_list = list(segments)
        full_text = " ".join([seg.text.strip() for seg in segments_list])
        word_count = len([w for w in full_text.split() if w.strip()])

        print(f"[INFO] Whisper initial segments: {len(segments_list)}, words: {word_count}, duration: {info.duration:.1f}s")

        if word_count <= 3 and info.duration >= 8:
            print("[WARN] Short initial transcript; retrying with more accuracy settings")
            segments2, info2 = model.transcribe(
                file_path,
                language=language or "en",
                beam_size=5,
                best_of=3,
                temperature=0.4,
                word_timestamps=False,
            )
            segments_list2 = list(segments2)
            full_text2 = " ".join([seg.text.strip() for seg in segments_list2])
            word_count2 = len([w for w in full_text2.split() if w.strip()])

            if word_count2 > word_count:
                segments_list = segments_list2
                full_text = full_text2
                info = info2
                word_count = word_count2

        transcript = {
            "text": full_text,
            "segments": [
                {"start": float(s.start), "end": float(s.end), "text": s.text.strip()}
                for s in segments_list
            ],
            "language": info.language,
            "language_probability": float(info.language_probability) if info.language_probability else None,
        }

    except Exception as e:
        print(f"❌ Error during faster-whisper transcription: {str(e)}")
        transcript = {"text": "", "segments": [], "error": str(e)}

    if out_json:
        _save_json(transcript, out_json)
    return transcript


def transcribe_with_whisper(file_path, model_name="tiny", language=None, out_json=None):
    """
    Transcribe audio using faster-whisper (offline, runs locally).
    This is the ONLY transcription method - Vosk is deprecated due to poor accuracy and extreme slowness.
    
    Model sizes:
    - tiny: ~39MB, fastest, good accuracy for English
    - base: ~74MB, balanced
    - small: ~244MB, better accuracy
    - medium: ~769MB (requires more RAM)
    """
    # Always use faster-whisper for online/offline transcription
    return _transcribe_with_faster_whisper(file_path, model_name=model_name, language=language, out_json=out_json)


def transcribe_audio(uploaded_file, tmp_dir=None, model_name="vosk-model-en-us-0.22", language=None):
    """
    Save uploaded_file (Streamlit UploadedFile) to temp path and transcribe using Vosk.
    Returns (audio_path, transcript_dict, json_path)
    
    Args:
        uploaded_file: Streamlit UploadedFile object
        tmp_dir: Temporary directory for files
        model_name: Vosk model name (default: vosk-model-en-us-0.22)
        language: Language code (ignored for Vosk, model-specific)
    """
    tmp_dir = tmp_dir or tempfile.gettempdir()
    Path(tmp_dir).mkdir(parents=True, exist_ok=True)
    suffix = Path(uploaded_file.name).suffix or ".wav"
    tmp_path = os.path.join(tmp_dir, f"meeting_audio{suffix}")
    with open(tmp_path, "wb") as fh:
        fh.write(uploaded_file.getbuffer())

    json_path = os.path.join(tmp_dir, Path(uploaded_file.name).stem + "_transcript.json")
    transcript = transcribe_with_whisper(tmp_path, model_name=model_name, language=language, out_json=json_path)
    return tmp_path, transcript, json_path


def transcribe_audio_bytes(
    audio_data: np.ndarray,
    sample_rate: int = 16000,
    model_name: str = "tiny",
    language: Optional[str] = None,
) -> Dict:
    """
    Transcribe audio from numpy array using faster-whisper (local, offline).
    
    Args:
        audio_data: Numpy array of audio samples (float32, normalized to [-1, 1])
        sample_rate: Sample rate of the audio (default: 16000 Hz)
        model_name: Whisper model name (tiny/base/small) - default: tiny for speed
        language: Language code (optional, for auto-detect use None)
    
    Returns:
        Dictionary with 'text', 'segments', and metadata
    """
    try:
        # Use faster-whisper for efficient transcription
        model = _load_faster_whisper_model(model_name, device="cpu")

        # Convert numpy array to 16-bit PCM
        audio_int16 = np.int16(audio_data / np.max(np.abs(audio_data) + 1e-8) * 32767)
        
        # Create WAV data in memory
        wav_buffer = io.BytesIO()
        with wave.open(wav_buffer, 'wb') as wav_file:
            wav_file.setnchannels(1)  # Mono
            wav_file.setsampwidth(2)  # 16-bit
            wav_file.setframerate(sample_rate)
            wav_file.writeframes(audio_int16.tobytes())
        
        wav_buffer.seek(0)
        
        # Save temporarily to disk (faster-whisper requires file path)
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
        temp_file.write(wav_buffer.getvalue())
        temp_file.close()
        
        segments, info = model.transcribe(
            temp_file.name,
            language=language,
            beam_size=1,
            best_of=1,
            temperature=0.0,
        )
        
        segments_list = list(segments)
        full_text = " ".join([seg.text.strip() for seg in segments_list])
        
        os.unlink(temp_file.name)

        transcript = {
            "text": full_text,
            "segments": [
                {"start": float(s.start), "end": float(s.end), "text": s.text.strip()}
                for s in segments_list
            ],
            "language": info.language,
            "language_probability": float(info.language_probability) if info.language_probability else None,
        }
        
        return transcript
        
    except Exception as e:
        print(f"❌ Error during audio bytes transcription: {str(e)}")
        return {"text": "", "segments": [], "error": str(e)}
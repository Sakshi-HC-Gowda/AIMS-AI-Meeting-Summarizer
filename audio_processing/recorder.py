"""
Live audio recording module with real-time transcription support.
Supports both streaming recording and batch processing.
Works completely offline using faster-whisper.
"""
import io
import json
import wave
from pathlib import Path
from typing import Callable, Dict, List, Optional, Tuple

import numpy as np


def record_audio_chunk(
    duration: float = 5.0,
    sample_rate: int = 16000,
    channels: int = 1,
) -> Tuple[np.ndarray, int]:
    """
    Record audio chunk from microphone.
    
    Args:
        duration: Recording duration in seconds
        sample_rate: Audio sample rate (Hz)
        channels: Number of audio channels (1=mono, 2=stereo)
    
    Returns:
        Tuple of (audio_data, sample_rate)
    """
    try:
        import pyaudio

        audio = pyaudio.PyAudio()

        # Open stream
        stream = audio.open(
            format=pyaudio.paFloat32,
            channels=channels,
            rate=sample_rate,
            input=True,
            frames_per_buffer=4096,
        )

        print(f"🎙️ Recording for {duration} seconds...")
        frames = []

        # Record frames
        num_frames = int(sample_rate * duration / 4096)
        for _ in range(num_frames):
            try:
                data = stream.read(4096, exception_on_overflow=False)
                frames.append(data)
            except Exception as e:
                print(f"Warning: Error reading frame - {e}")
                break

        stream.stop_stream()
        stream.close()
        audio.terminate()

        # Convert to numpy array
        audio_data = b"".join(frames)
        audio_np = np.frombuffer(audio_data, dtype=np.float32)

        print(f"✅ Recording complete. Total samples: {len(audio_np)}")
        return audio_np, sample_rate

    except Exception as e:
        raise Exception(f"Recording failed: {str(e)}")


def save_audio_to_wav(
    audio_data: np.ndarray,
    sample_rate: int,
    output_path: str,
    channels: int = 1,
) -> str:
    """
    Save numpy audio array to WAV file.
    
    Args:
        audio_data: Numpy array of audio samples
        sample_rate: Sample rate of audio
        output_path: Path to save WAV file
        channels: Number of channels
    
    Returns:
        Path to saved file
    """
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)

    # Normalize audio to int16 range
    audio_int16 = np.int16(audio_data / np.max(np.abs(audio_data)) * 32767)

    with wave.open(output_path, "w") as wav_file:
        wav_file.setnchannels(channels)
        wav_file.setsampwidth(2)  # 2 bytes for int16
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(audio_int16.tobytes())

    print(f"💾 Audio saved to: {output_path}")
    return output_path


def load_audio_file(file_path: str) -> Tuple[np.ndarray, int]:
    """
    Load audio file (WAV, MP3, etc.) and convert to numpy array.
    
    Args:
        file_path: Path to audio file
    
    Returns:
        Tuple of (audio_data, sample_rate)
    """
    try:
        import librosa

        audio_data, sample_rate = librosa.load(file_path, sr=16000, mono=True)
        return audio_data, sample_rate
    except Exception as e:
        raise Exception(f"Failed to load audio file: {str(e)}")


def stream_recording_with_transcription(
    duration: float = 30.0,
    sample_rate: int = 16000,
    model_name: str = "base",
    device: str = "cpu",
    on_chunk_transcribed: Optional[Callable[[Dict], None]] = None,
) -> Dict:
    """
    Live recording with real-time transcription of chunks.
    
    Args:
        duration: Total recording duration in seconds
        sample_rate: Sample rate for recording
        model_name: faster-whisper model size (tiny, base, small, medium, large)
        device: Device to use (cpu, cuda)
        on_chunk_transcribed: Callback function called after each chunk is transcribed
    
    Returns:
        Dict with full_text and segments
    """
    from audio_processing.transcribe import transcribe_audio_bytes

    try:
        import pyaudio

        audio = pyaudio.PyAudio()
        stream = audio.open(
            format=pyaudio.paFloat32,
            channels=1,
            rate=sample_rate,
            input=True,
            frames_per_buffer=4096,
        )

        print(f"🎙️ Starting live transcription for {duration} seconds...")
        frames = []
        chunk_duration = 10  # Transcribe every 10 seconds
        chunk_frames = int(sample_rate * chunk_duration / 4096)
        frame_count = 0
        total_frames = int(sample_rate * duration / 4096)
        all_segments = []
        full_text = ""

        while frame_count < total_frames:
            try:
                # Record chunk
                chunk_data = b""
                chunk_frame_count = 0

                while chunk_frame_count < chunk_frames and frame_count < total_frames:
                    data = stream.read(4096, exception_on_overflow=False)
                    chunk_data += data
                    frames.append(data)
                    chunk_frame_count += 1
                    frame_count += 1

                # Convert to numpy
                audio_chunk = np.frombuffer(chunk_data, dtype=np.float32)

                # Transcribe chunk
                result = transcribe_audio_bytes(
                    audio_chunk,
                    sample_rate,
                    model_name=model_name,
                    device=device,
                )

                if result.get("text"):
                    print(f"  📝 Chunk: {result['text'][:100]}...")
                    all_segments.extend(result.get("segments", []))
                    full_text += " " + result["text"]

                    if on_chunk_transcribed:
                        on_chunk_transcribed(
                            {"text": result["text"], "segments": result.get("segments", [])}
                        )

            except Exception as e:
                print(f"Warning during chunk processing: {e}")

        stream.stop_stream()
        stream.close()
        audio.terminate()

        return {
            "text": full_text.strip(),
            "segments": all_segments,
            "duration": duration,
        }

    except Exception as e:
        raise Exception(f"Live transcription failed: {str(e)}")


def create_audio_buffer_from_bytes(audio_bytes: bytes) -> io.BytesIO:
    """Create BytesIO buffer from audio bytes (useful for streaming)."""
    return io.BytesIO(audio_bytes)

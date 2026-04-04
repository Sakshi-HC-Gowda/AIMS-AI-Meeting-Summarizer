#!/usr/bin/env python3
"""
Live Meeting Recording and Transcription CLI Tool
- Records audio from microphone
- Real-time transcription using faster-whisper
- Editable transcription interface
- Offline-first architecture

Usage:
    python record_meeting.py
"""
import sys
import os
from pathlib import Path
import json
from datetime import datetime
import tempfile

# Add project root to path
PROJECT_ROOT = Path(__file__).parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from audio_processing.recorder import record_audio_chunk, save_audio_to_wav
from audio_processing.transcribe import transcribe_audio_bytes
import numpy as np


class MeetingRecorder:
    """CLI interface for recording and transcribing meetings."""

    def __init__(self, model_size: str = "base"):
        """
        Initialize recorder.
        
        Args:
            model_size: faster-whisper model size (tiny, base, small, medium, large)
                       - tiny: ~39M, fastest (3-4s per minute)
                       - base: ~74M, balanced (5-6s per minute)  ← RECOMMENDED
                       - small: ~244M, better quality
        """
        self.model_size = model_size
        self.session_id = datetime.now().strftime("%Y%m%d_%H%M%S")
        self.output_dir = Path(tempfile.gettempdir()) / "meeting_recordings" / self.session_id
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.transcript_text = ""
        self.transcript_segments = []

    def display_banner(self):
        """Show welcome banner."""
        print("\n" + "="*70)
        print("🎙️  MEETING RECORDING & TRANSCRIPTION TOOL (OFFLINE)")
        print("="*70)
        print(f"📍 Model: {self.model_size.upper()} (faster-whisper)")
        print(f"⏱️  Session ID: {self.session_id}")
        print(f"💾 Output: {self.output_dir}")
        print("="*70 + "\n")

    def show_menu(self):
        """Display main menu."""
        print("\n📋 OPTIONS:")
        print("  1. Record Meeting (live microphone input)")
        print("  2. Transcribe Audio File")
        print("  3. View/Edit Current Transcript")
        print("  4. Save Transcript")
        print("  5. Exit")
        return input("\n👉 Select option (1-5): ").strip()

    def record_meeting(self, duration: int = 300):
        """
        Record meeting from microphone.
        
        Args:
            duration: Recording duration in seconds (default: 5 minutes)
        """
        print(f"\n🎙️  Recording for {duration} seconds (about {duration//60} minutes)...")
        print("⚠️  Make sure your microphone is connected and working!")
        print("Press Ctrl+C to stop recording anytime.\n")

        try:
            # Record audio
            audio_data, sample_rate = record_audio_chunk(
                duration=duration,
                sample_rate=16000,
                channels=1,
            )

            # Save recorded audio
            audio_path = self.output_dir / "recording.wav"
            save_audio_to_wav(audio_data, sample_rate, str(audio_path))

            # Transcribe immediately
            print("\n⏳ Transcribing recording using faster-whisper...")
            transcript = transcribe_audio_bytes(
                audio_data,
                sample_rate=sample_rate,
                model_name=self.model_size,
                language=None,  # Auto-detect
            )

            self.transcript_text = transcript.get("text", "")
            self.transcript_segments = transcript.get("segments", [])

            print("\n✅ Transcription complete!")
            print(f"📝 Duration: {transcript.get('language', 'auto-detected')}")
            print(f"📄 Text length: {len(self.transcript_text)} characters\n")
            print("Transcript Preview:")
            print("-" * 70)
            print(self.transcript_text[:500] + ("..." if len(self.transcript_text) > 500 else ""))
            print("-" * 70)

            return True

        except KeyboardInterrupt:
            print("\n\n⚠️  Recording interrupted by user.")
            return False
        except Exception as e:
            print(f"\n❌ Recording failed: {str(e)}")
            return False

    def transcribe_file(self, file_path: str = None):
        """
        Transcribe an existing audio file.
        
        Args:
            file_path: Path to audio file (WAV, MP3, M4A, etc.)
        """
        if not file_path:
            file_path = input("📁 Enter audio file path: ").strip()

        if not Path(file_path).exists():
            print(f"❌ File not found: {file_path}")
            return False

        try:
            print(f"\n⏳ Transcribing: {Path(file_path).name}")
            from audio_processing.transcribe import transcribe_with_whisper

            transcript = transcribe_with_whisper(
                file_path,
                model_name=self.model_size,
                language=None,
            )

            self.transcript_text = transcript.get("text", "")
            self.transcript_segments = transcript.get("segments", [])

            print("✅ Transcription complete!\n")
            print("Transcript Preview:")
            print("-" * 70)
            print(self.transcript_text[:500] + ("..." if len(self.transcript_text) > 500 else ""))
            print("-" * 70)

            return True

        except Exception as e:
            print(f"❌ Transcription failed: {str(e)}")
            return False

    def edit_transcript(self):
        """
        Interactive transcript editor.
        """
        if not self.transcript_text:
            print("❌ No transcript to edit. Record or transcribe first.")
            return

        print("\n📝 TRANSCRIPT EDITOR")
        print("=" * 70)
        print(self.transcript_text)
        print("=" * 70)
        print("\nOptions:")
        print("  1. Edit full text")
        print("  2. View segments (with timestamps)")
        print("  3. Back to menu")

        choice = input("\n👉 Select option (1-3): ").strip()

        if choice == "1":
            print("\nEnter edited transcript (press Enter twice to finish):")
            lines = []
            while True:
                line = input()
                if line == "" and lines and lines[-1] == "":
                    break
                lines.append(line)
            self.transcript_text = "\n".join(lines[:-1])  # Remove last empty line
            print("✅ Transcript updated!")

        elif choice == "2":
            print("\n📊 TRANSCRIPT SEGMENTS (with timestamps):")
            print("-" * 70)
            for i, seg in enumerate(self.transcript_segments, 1):
                print(
                    f"[{seg.get('start', 0):.1f}s - {seg.get('end', 0):.1f}s] "
                    f"{seg.get('text', '')}"
                )
            print("-" * 70)

    def save_transcript(self):
        """
        Save transcript to file and prepare for summarization.
        """
        if not self.transcript_text:
            print("❌ No transcript to save.")
            return

        # Save as JSON
        transcript_data = {
            "session_id": self.session_id,
            "timestamp": datetime.now().isoformat(),
            "model": self.model_size,
            "transcript": self.transcript_text,
            "segments": self.transcript_segments,
        }

        json_path = self.output_dir / "transcript.json"
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(transcript_data, f, ensure_ascii=False, indent=2)

        # Also save as plain text
        txt_path = self.output_dir / "transcript.txt"
        with open(txt_path, "w", encoding="utf-8") as f:
            f.write(self.transcript_text)

        print(f"\n✅ Transcript saved!")
        print(f"📄 JSON: {json_path}")
        print(f"📄 TXT: {txt_path}")
        print(f"\n💡 Next steps:")
        print(f"   1. Copy the transcript text above, or")
        print(f"   2. Upload the JSON/TXT file to the web interface for summarization")
        print(f"   3. Or use the API endpoint: /api/transcribe with this session ID")

        return str(txt_path)

    def run(self):
        """Main CLI loop."""
        self.display_banner()

        while True:
            choice = self.show_menu()

            if choice == "1":
                # Get recording duration
                duration_input = input("\n⏱️  Recording duration in seconds (default 300): ").strip()
                duration = int(duration_input) if duration_input.isdigit() else 300
                self.record_meeting(duration=duration)

            elif choice == "2":
                file_path = input("\n📁 Enter audio file path: ").strip()
                self.transcribe_file(file_path)

            elif choice == "3":
                self.edit_transcript()

            elif choice == "4":
                self.save_transcript()

            elif choice == "5":
                print("\n🎙️  Thank you for using Meeting Recorder!")
                print("😊 Goodbye!\n")
                break

            else:
                print("❌ Invalid option. Please select 1-5.")


def main():
    """Entry point."""
    try:
        print("\n🚀 Starting Meeting Recorder...")
        print("ℹ️  Checking dependencies...\n")

        # Check required packages
        try:
            import faster_whisper
            print("✅ faster-whisper is installed")
        except ImportError:
            print("⚠️  faster-whisper not found. Installing...")
            os.system("pip install faster-whisper")

        try:
            import pyaudio
            print("✅ pyaudio is installed")
        except ImportError:
            print("⚠️  pyaudio not found. Installing...")
            os.system("pip install pyaudio")

        try:
            import librosa
            print("✅ librosa is installed")
        except ImportError:
            print("⚠️  librosa not found. Installing...")
            os.system("pip install librosa")

        # Get model size preference
        print("\n🤖 Model Selection (for speed vs quality trade-off):")
        print("   tiny: fastest (3-4s per minute)")
        print("   base: balanced - RECOMMENDED (5-6s per minute)")
        print("   small: better quality (10-12s per minute)")
        model_input = input("\nSelect model (default: base): ").strip().lower()
        model_size = model_input if model_input in [
            "tiny",
            "base",
            "small",
            "medium",
            "large",
        ] else "base"

        # Start recorder
        recorder = MeetingRecorder(model_size=model_size)
        recorder.run()

    except KeyboardInterrupt:
        print("\n\n👋 Interrupted by user. Goodbye!")
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main()

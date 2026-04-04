#!/usr/bin/env python3
"""
AIMS Recording Feature - Health Check Script
Verify that all components are properly installed and working.
"""
import sys
from pathlib import Path

# Add project to path
PROJECT_ROOT = Path(__file__).parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

def check_python_version():
    """Check Python version."""
    print("🐍 Python Version Check")
    version_info = sys.version_info
    print(f"   Version: {version_info.major}.{version_info.minor}.{version_info.micro}")
    
    if version_info.major < 3 or (version_info.major == 3 and version_info.minor < 8):
        print("   ❌ FAILED: Need Python 3.8+")
        return False
    
    print("   ✅ OK\n")
    return True

def check_dependencies():
    """Check if required packages are installed."""
    print("📦 Dependency Check")
    
    required = {
        "flask": "Flask",
        "flask_cors": "Flask-CORS",
        "faster_whisper": "faster-whisper",
        "pyaudio": "pyaudio (optional for live recording)",
        "numpy": "NumPy",
        "librosa": "librosa",
        "transformers": "transformers",
        "torch": "PyTorch",
    }
    
    all_ok = True
    for module_name, display_name in required.items():
        try:
            __import__(module_name)
            print(f"   ✅ {display_name}")
        except ImportError:
            print(f"   ❌ {display_name} - NOT INSTALLED")
            all_ok = False
    
    if not all_ok:
        print("\n   Run: pip install -r requirements.txt\n")
    else:
        print()
    
    return all_ok

def check_faster_whisper():
    """Check faster-whisper specific info."""
    print("⚡ faster-whisper Details")
    try:
        from faster_whisper import WhisperModel
        print("   ✅ faster-whisper is installed")
        
        # Try to see if models are cached
        import os
        cache_dir = os.path.expanduser("~/.cache/huggingface/hub/")
        if os.path.exists(cache_dir):
            models = [d for d in os.listdir(cache_dir) if "whisper" in d.lower()]
            if models:
                print(f"   💾 Cached models: {len(models)}")
                for model in models[:3]:
                    print(f"      - {model}")
            else:
                print("   💾 No cached models (will download on first use)")
        else:
            print("   💾 No cache directory (will create on first use)")
        print()
        return True
    except ImportError:
        print("   ❌ faster-whisper NOT installed")
        print("   Run: pip install faster-whisper\n")
        return False

def check_pyaudio():
    """Check pyaudio for live recording."""
    print("🎙️ PyAudio Check (for live recording)")
    try:
        import pyaudio
        print("   ✅ pyaudio is installed")
        
        # Try to list audio devices
        audio = pyaudio.PyAudio()
        device_count = audio.get_device_count()
        print(f"   🔊 Found {device_count} audio device(s)")
        
        # Find default input device
        default_in = audio.get_default_input_device_info()
        print(f"   🎤 Default microphone: {default_in['name']}")
        audio.terminate()
        print()
        return True
    except ImportError:
        print("   ⚠️  pyaudio NOT installed")
        print("   Run: pip install pyaudio")
        print("   (Optional - needed for live recording feature)\n")
        return False
    except Exception as e:
        print(f"   ⚠️  Error checking PyAudio: {e}")
        print("   (This might be OK - PyAudio is optional)\n")
        return False

def check_backend_requirements():
    """Check backend-specific requirements."""
    print("🔧 Backend Requirements")
    
    try:
        # Check Flask
        import flask
        print(f"   ✅ Flask {flask.__version__}")
        
        # Check CORS
        import flask_cors
        print(f"   ✅ Flask-CORS")
        
        # Check meeting service can be imported
        from backend.services.meeting_service import MeetingService
        print(f"   ✅ MeetingService")
        
        # Check recording service
        from backend.services.recording_service import RecordingService
        print(f"   ✅ RecordingService")
        
        print()
        return True
    except ImportError as e:
        print(f"   ❌ Import error: {e}")
        print()
        return False

def check_backend_health():
    """Check if backend API is running."""
    print("🔌 Backend Health Check")
    try:
        import requests
        response = requests.get("http://localhost:5000/api/health", timeout=2)
        if response.status_code == 200:
            data = response.json()
            if data.get("success") or data.get("status") == "healthy":
                print("   ✅ Backend is running on http://localhost:5000")
                print()
                return True
            else:
                print(f"   ⚠️  Got response but status unclear: {data}")
                print()
                return False
        else:
            print(f"   ❌ Backend returned status {response.status_code}")
            print()
            return False
    except requests.exceptions.ConnectionError:
        print("   ⚠️  Backend not running (start with: python app.py)")
        print()
        return False
    except Exception as e:
        print(f"   ⚠️  Error: {e}")
        print()
        return False

def check_frontend():
    """Check if frontend setup looks good."""
    print("🎨 Frontend Check")
    
    frontend_dir = PROJECT_ROOT / "frontend"
    if not frontend_dir.exists():
        print("   ❌ Frontend directory not found")
        return False
    
    # Check package.json
    package_json = frontend_dir / "package.json"
    if package_json.exists():
        print("   ✅ package.json found")
    else:
        print("   ❌ package.json not found")
        return False
    
    # Check if node_modules exists
    node_modules = frontend_dir / "node_modules"
    if node_modules.exists():
        print("   ✅ node_modules installed")
    else:
        print("   ⚠️  node_modules not found (run: npm install)")
    
    # Check RecordingStep component
    recording_step = frontend_dir / "src" / "components" / "RecordingStep.jsx"
    if recording_step.exists():
        print("   ✅ RecordingStep component found")
    else:
        print("   ❌ RecordingStep component not found")
        return False
    
    print()
    return True

def main():
    """Run all checks."""
    print("\n" + "="*70)
    print("🎙️  AIMS Recording Feature - Health Check")
    print("="*70 + "\n")
    
    checks = [
        ("Python Version", check_python_version),
        ("Dependencies", check_dependencies),
        ("faster-whisper", check_faster_whisper),
        ("PyAudio", check_pyaudio),
        ("Backend Requirements", check_backend_requirements),
        ("Backend Health", check_backend_health),
        ("Frontend", check_frontend),
    ]
    
    results = []
    for name, check_func in checks:
        try:
            result = check_func()
            results.append((name, result))
        except Exception as e:
            print(f"❌ {name} check failed: {e}\n")
            results.append((name, False))
    
    # Summary
    print("="*70)
    print("📊 SUMMARY")
    print("="*70)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {name}")
    
    print(f"\nTotal: {passed}/{total} checks passed\n")
    
    if passed == total:
        print("🎉 Everything looks good! You're ready to use the recording feature.\n")
        return 0
    elif passed >= total - 2:
        print("⚠️  Most things are working. Some optional features may not work.\n")
        return 0
    else:
        print("❌ Some critical components are missing. Please fix the errors above.\n")
        return 1

if __name__ == "__main__":
    sys.exit(main())

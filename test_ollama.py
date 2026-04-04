#!/usr/bin/env python3
"""
Quick test script to verify Ollama is running and Gemma 3 model is available.
Run this before starting the main application to ensure offline summarization will work.

Usage:
    python test_ollama.py
"""

import sys
import requests
import json
from pathlib import Path

# Add project root to path
PROJECT_ROOT = Path(__file__).parent
sys.path.insert(0, str(PROJECT_ROOT))


def test_ollama_connection():
    """Test if Ollama service is running."""
    print("🔍 Testing Ollama connection...")
    
    try:
        response = requests.get("http://localhost:11434/api/tags", timeout=5)
        response.raise_for_status()
        print("✅ Ollama service is running at http://localhost:11434")
        return True
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to Ollama service")
        print("   Make sure Ollama is running: 'ollama serve'")
        return False
    except Exception as e:
        print(f"❌ Error connecting to Ollama: {e}")
        return False


def test_gemma3_model():
    """Test if Gemma 3 model is available."""
    print("\n🔍 Checking for Gemma 3 model...")
    
    try:
        response = requests.get("http://localhost:11434/api/tags", timeout=5)
        response.raise_for_status()
        models = response.json().get("models", [])
        
        model_names = [m.get("name", "") for m in models]
        
        if not model_names:
            print("❌ No models found in Ollama")
            print("   Pull Gemma 3: 'ollama pull gemma3'")
            return False
        
        print(f"   Available models: {', '.join(model_names)}")
        
        if "gemma3" in model_names or "gemma3:latest" in model_names or any("gemma3" in m for m in model_names):
            print("✅ Gemma 3 model is installed")
            return True
        else:
            print("❌ Gemma 3 model not found")
            print("   Pull it with: 'ollama pull gemma3'")
            return False
            
    except Exception as e:
        print(f"❌ Error checking models: {e}")
        return False


def test_ollama_generation():
    """Test if Ollama can generate text."""
    print("\n🔍 Testing Ollama text generation...")
    
    try:
        payload = {
            "model": "gemma3",
            "prompt": "Summarize this in one sentence: The meeting discussed project timelines and budget allocation.",
            "stream": False,
            "options": {
                "num_predict": 50,
                "temperature": 0.1,
            }
        }
        
        response = requests.post(
            "http://localhost:11434/api/generate",
            json=payload,
            timeout=120
        )
        response.raise_for_status()
        result = response.json()
        
        generated_text = result.get("response", "").strip()
        if generated_text:
            print(f"✅ Generation works!")
            print(f"   Sample output: {generated_text[:100]}...")
            return True
        else:
            print("❌ Generation returned empty response")
            return False
            
    except requests.exceptions.Timeout:
        print("❌ Generation timed out")
        print("   Model might be loading. Try again in a moment.")
        return False
    except Exception as e:
        print(f"❌ Generation error: {e}")
        return False


def test_app_imports():
    """Test if the app can import the summarizer module."""
    print("\n🔍 Testing app imports...")
    
    try:
        from summarizer.ollama_summarizer import (
            summarize_chunks_ollama,
            summarize_global_ollama,
            build_topic_bullets_from_chunks_ollama,
            merge_bullet_summaries_ollama,
        )
        print("✅ App imports successful")
        return True
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False


def main():
    """Run all tests."""
    print("=" * 60)
    print("OLLAMA & SUMMARIZER INTEGRATION TEST")
    print("=" * 60)
    
    results = []
    
    results.append(("Ollama Connection", test_ollama_connection()))
    results.append(("Gemma 3 Model", test_gemma3_model()))
    results.append(("Text Generation", test_ollama_generation()))
    results.append(("App Imports", test_app_imports()))
    
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! You're ready to use offline summarization.")
        return 0
    else:
        print("\n⚠️  Some tests failed. Check the errors above and fix them.")
        print("\nCommon solutions:")
        print("1. Start Ollama: 'ollama serve'")
        print("2. Pull Gemma 3: 'ollama pull gemma3'")
        print("3. Wait for model to load (first run takes 2-3 minutes)")
        return 1


if __name__ == "__main__":
    sys.exit(main())

"""
Ollama-Based Offline Summarizer using Gemma 3 Model
This module handles all summarization using Ollama local LLM service.
Requires: Ollama installed and running with 'ollama serve' before use
"""

import os
import requests
import json
from typing import List, Dict
import re

# Ollama Configuration
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
MODEL_NAME = os.getenv("OLLAMA_MODEL_NAME", "gemma3:latest")
TIMEOUT = int(os.getenv("OLLAMA_TIMEOUT", "120"))  # request timeout in seconds
OLLAMA_WARMUP = os.getenv("OLLAMA_WARMUP", "true").lower() in ("1", "true", "yes")
WARMUP_PROMPT = os.getenv("OLLAMA_WARMUP_PROMPT", "Please summarize this short sentence:")

_OLLAMA_SESSION = requests.Session()


def _call_ollama(prompt: str, max_tokens: int = 200) -> str:
    """
    Call Ollama API to generate text from a prompt.
    
    Args:
        prompt: The text prompt to send to Ollama
        max_tokens: Maximum number of tokens to generate
        
    Returns:
        Generated text response from Ollama
    """
    payload = {
        "model": MODEL_NAME,
        "prompt": prompt,
        "stream": False,
        "options": {
            "num_predict": max_tokens,
            "temperature": 0.1,  # Low temperature for consistent summaries
        }
    }
    
    try:
        response = _OLLAMA_SESSION.post(OLLAMA_URL, json=payload, timeout=TIMEOUT)
        response.raise_for_status()
        result = response.json()
        return result.get("response", "").strip()
    except requests.exceptions.ConnectionError:
        raise RuntimeError(
            f"Cannot connect to Ollama at {OLLAMA_URL}. "
            "Please ensure Ollama is running with: 'ollama serve'"
        )
    except requests.exceptions.Timeout:
        raise RuntimeError(
            f"Ollama request timed out. "
            "This may happen if the model is loading or the system is under heavy load."
        )
    except Exception as e:
        raise RuntimeError(f"Ollama API error: {e}")


def warmup_ollama_model() -> None:
    """
    Warm up the Ollama model so the first real user request is faster.
    """
    if not OLLAMA_WARMUP:
        return

    try:
        _call_ollama(f"{WARMUP_PROMPT}\nSummary:", max_tokens=5)
        print("[INFO] Ollama warmup completed.")
    except Exception as e:
        print(f"[WARN] Ollama warmup failed: {e}")


def _clean_transcript_for_global_summary(text: str) -> str:
    """
    Clean transcript text before summarization.
    Removes speaker labels, filler words, and normalizes whitespace.
    """
    if not text:
        return ""
    
    cleaned = text
    # Remove speaker labels
    cleaned = re.sub(r"(?im)^\s*Speaker\s*\d*:?\s*", "", cleaned)
    cleaned = re.sub(
        r"(?im)^\s*(?:[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\s*:\s+",
        "",
        cleaned,
    )
    # Remove filler words
    cleaned = re.sub(
        r"\b(oo|umm+|aa+|ok|yes|done|trending now|I'll finish|I will finish)\b",
        "",
        cleaned,
        flags=re.IGNORECASE,
    )
    cleaned = re.sub(r"\s+", " ", cleaned)
    return cleaned.strip()


def _format_summary_output(summary_text: str) -> str:
    """
    Format the summary output to ensure it follows expected structure.
    Removes any instruction text that might have been included.
    """
    if not summary_text:
        return ""
    
    lines = summary_text.split('\n')
    filtered_lines = []
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        # Skip lines that look like instructions
        if any(phrase in line.lower() for phrase in [
            "create a clear", "format:", "transcript:", "speaker names", "filler words"
        ]):
            continue
        filtered_lines.append(line)
    
    return '\n'.join(filtered_lines)


def summarize_chunks_ollama(chunks: List[Dict], **kwargs) -> List[Dict]:
    """
    Summarize each chunk using Ollama Gemma 3 model.
    Returns list of summaries with start/end times and summary text.
    
    Args:
        chunks: List of chunk dicts with 'text', 'start', 'end'
        **kwargs: Additional parameters (ignored, for compatibility with bart summarizer)
        
    Returns:
        List of dicts with 'start', 'end', 'summary' keys
    """
    summaries = []
    
    for c in chunks:
        text = c.get("text", "")
        if not text:
            summaries.append({
                "start": c.get("start", 0),
                "end": c.get("end", 0),
                "summary": "",
            })
            continue
            
        # Create prompt for chunk summarization
        prompt = f"""Please summarize the following meeting transcript chunk in 2-4 sentences:

{text}

Summary:"""
        
        try:
            summary_text = _call_ollama(prompt, max_tokens=150)
        except RuntimeError as e:
            print(f"Warning: {e}")
            # Fallback: take first few sentences
            sentences = [s.strip() for s in text.split('.') if s.strip()]
            summary_text = '. '.join(sentences[:3]) + '.' if sentences else text[:300]
        
        if not summary_text:
            # Fallback: take first few sentences
            sentences = [s.strip() for s in text.split('.') if s.strip()]
            summary_text = '. '.join(sentences[:3]) + '.' if sentences else text[:300]
        
        summaries.append({
            "start": c.get("start", 0),
            "end": c.get("end", 0),
            "summary": summary_text,
        })
    
    return summaries


def summarize_global_ollama(text: str, **kwargs) -> str:
    """
    Create a global summary of the entire meeting using Ollama.
    
    Args:
        text: Full meeting transcript text
        **kwargs: Additional parameters (ignored, for compatibility with bart summarizer)
        
    Returns:
        Formatted global summary
    """
    if not text or len(text) < 40:
        return text or ""
    
    # Clean the text
    cleaned = _clean_transcript_for_global_summary(text)
    cleaned = cleaned[:4000]  # Limit input size to avoid token limits
    
    prompt = f"""Create a clear professional meeting summary without speaker names or filler words.

Format your response as:
1. One paragraph (2-4 sentences) overview
2. 4-8 bullet points of main decisions, insights, and next steps

Transcript:
{cleaned}

Summary:"""
    
    try:
        summary = _call_ollama(prompt, max_tokens=400)
    except RuntimeError as e:
        print(f"Warning: {e}")
        summary = None
    
    if not summary:
        # Fallback
        return cleaned[:600]
    
    return _format_summary_output(summary)


def merge_summaries_text(summaries: List[Dict]) -> str:
    """
    Merge chunk summaries into a single text.
    
    Args:
        summaries: List of summary dicts with 'summary' key
        
    Returns:
        Merged summary text
    """
    return "\n\n".join([s.get("summary", "") for s in summaries if s.get("summary")])


def build_topic_bullets_from_chunks_ollama(summaries: List[Dict], **kwargs) -> str:
    """
    Convert chunk summaries into structured bullet points using Ollama.
    
    Args:
        summaries: List of summary dicts
        **kwargs: Additional parameters like max_bullets (default 15)
        
    Returns:
        Formatted bullet points
    """
    max_bullets = kwargs.get('max_bullets', 15)
    
    if not summaries:
        return ""
    
    # Combine all chunk summaries
    combined_text = merge_summaries_text(summaries)
    
    if len(combined_text) < 100:
        return combined_text
    
    prompt = f"""Extract the main topics and key points from this meeting summary and format them as bullet points.
Limit to {max_bullets} bullets maximum. Focus on decisions, actions, and important insights.

Summary text:
{combined_text}

Bullet points:"""
    
    try:
        bullets = _call_ollama(prompt, max_tokens=300)
    except RuntimeError as e:
        print(f"Warning: {e}")
        bullets = None
    
    if not bullets:
        # Fallback: split into simple bullets
        sentences = [s.strip() for s in combined_text.split('.') if s.strip()]
        bullets = '\n'.join(f"• {s}" for s in sentences[:max_bullets])
    
    return bullets


def merge_bullet_summaries_ollama(topic_bullets: str, global_summary: str) -> str:
    """
    Merge topic bullets and global summary into final output.
    
    Args:
        topic_bullets: Formatted bullet points
        global_summary: Global summary text
        
    Returns:
        Combined final summary
    """
    if not topic_bullets and not global_summary:
        return ""
    
    if not topic_bullets:
        return global_summary
    
    if not global_summary:
        return topic_bullets
    
    # Combine them with formatting
    return f"{global_summary}\n\nKey Topics:\n{topic_bullets}"

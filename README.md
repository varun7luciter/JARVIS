# J.A.R.V.I.S — Just A Rather Very Intelligent System
### Cinematic AI Voice Assistant & Futuristic Command Center

![Version](https://img.shields.io/badge/JARVIS_Core-Mark_VII_v4.2-00f0ff?style=for-the-badge&logo=atom)
![Framework](https://img.shields.io/badge/Backend-Django_REST_Framework-092e20?style=for-the-badge&logo=django)
![AI](https://img.shields.io/badge/AI_Engine-Groq_Llama_3.3_70B-f55036?style=for-the-badge)
![Voice](https://img.shields.io/badge/Voice-Web_Speech_API-0077fe?style=for-the-badge)

A production-ready full-stack AI voice assistant web application inspired by Iron Man's J.A.R.V.I.S system. The centerpiece is a multi-layered, interactive Arc Reactor interface that visually responds to conversation states (`IDLE`, `LISTENING`, `PROCESSING`, `SPEAKING`, `ERROR`). The system features real-time browser voice recognition (Web Speech API) with wake-word detection ("JARVIS"), natural speech synthesis audio playback, live acoustic waveform visualizers, real-time hardware telemetry gauges, and an ultra-fast Django REST backend powered by the Groq API (`llama-3.3-70b-versatile`).

---

## Key Features

- **Cinematic Arc Reactor Interface**:
  - Multi-layer concentric counter-rotating tech rings with tick calibrations and 10 copper inductor coils.
  - Palladium-vibranium glowing triangular energy core with central aperture.
  - 5 Dynamic State Animations: `IDLE` (calm cyan pulse), `LISTENING` (electric blue bloom & acoustic wave sync), `PROCESSING` (accelerated quantum rotation), `SPEAKING` (harmonic speech wave resonance), `ERROR` (crimson warning strobe with auto-recovery).
  - Dynamic ray burst and ambient particle dust engines.
- **Continuous Voice Control**:
  - Native Web Speech API (`SpeechRecognition`) with continuous listening.
  - Wake-word style activation: Say **"JARVIS"** or **"Hey JARVIS"** to trigger commands.
  - SpeechSynthesis voice playback with British/sophisticated English persona and synchronized pulse effects.
  - Real-time audio waveform visualizer canvas with frequency amplitude rendering.
- **High-Performance Django & Groq AI Backend**:
  - Ultra-low latency processing using Groq API (`llama-3.3-70b-versatile`).
  - Response time tracking, conversation SQLite persistence, and system activity logging.
  - Graceful fallback heuristic engine if offline or API key is not yet configured.
- **Tactical System Telemetry & Apps**:
  - 4 Animated Circular SVG gauges monitoring real CPU, RAM, Network, and Storage metrics via `psutil`.
  - Holographic 3D wireframe rotating neural matrix canvas.
  - Integrated Subsystems: Quantum Calculator, Encrypted Scratchpad/Notepad (localStorage saved), Web Search modal, File Archives, Weather, Maps, YouTube, News.
- **Futuristic HUD Design**:
  - High-tech glassmorphism (`backdrop-filter: blur(14px)`), cyber scanlines, and glowing neon palette.
  - Responsive layouts for Desktop (3 columns), Tablet (2 columns), and Mobile (1 column).

---

## Project Structure

```
4_project_IM/
├── jarvis_backend/                  # Django REST API Backend
│   ├── manage.py                    # Django management script
│   ├── requirements.txt             # Python dependencies
│   ├── .env.example                 # Environment configuration template
│   ├── .env                         # Local environment variables (excluded from git)
│   ├── .gitignore                   # Git exclusion rules
│   ├── db.sqlite3                   # SQLite database
│   ├── jarvis_backend/              # Django project core
│   │   ├── __init__.py
│   │   ├── settings.py              # App configuration & CORS
│   │   ├── urls.py                  # Root URL routes
│   │   ├── asgi.py
│   │   └── wsgi.py
│   └── assistant/                   # Main J.A.R.V.I.S assistant app
│       ├── __init__.py
│       ├── admin.py                 # Django admin registrations
│       ├── apps.py
│       ├── models.py                # ChatMessage & ActivityLog models
│       ├── serializers.py           # REST Framework serializers
│       ├── views.py                 # ChatAPIView, StatusAPIView, HistoryAPIView
│       └── urls.py                  # /api/ routes
├── frontend/                        # Command Center Web Application
│   ├── index.html                   # Semantic HTML5 HUD structure
│   ├── css/
│   │   └── style.css                # Futuristic design system & animations
│   ├── js/
│   │   └── app.js                   # State machine, Web Speech, & Groq client
│   └── assets/                      # Static icons and media assets
│       ├── images/
│       └── icons/
├── run_jarvis.py                    # Unified 1-click Python launcher
├── start_jarvis.bat                 # 1-click Windows batch launcher
├── test_backend.py                  # API automated test suite
└── README.md                        # Documentation
```

---

## Quick Start Guide (Windows)

### 1. Prerequisites
- Python 3.10+ installed ([python.org](https://www.python.org/))
- Chrome, Edge, or any Chromium browser for optimal Web Speech API voice support

### 2. Setup Virtual Environment & Install Dependencies
Open PowerShell or Command Prompt in the project folder:

```powershell
# Create virtual environment (if not already created)
python -m venv venv

# Activate the virtual environment
.\venv\Scripts\activate

# Install required dependencies
pip install -r jarvis_backend\requirements.txt
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` in `jarvis_backend/`:

```powershell
copy jarvis_backend\.env.example jarvis_backend\.env
```

Open `jarvis_backend\.env` in your text editor and add your **Groq API Key**:
```ini
# Get your free key at https://console.groq.com/keys
GROQ_API_KEY=gsk_your_actual_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
```
*(Note: If you run without an API key, J.A.R.V.I.S will still run using local fallback heuristic protocols).*

### 4. Run Database Migrations
```powershell
cd jarvis_backend
python manage.py migrate
cd ..
```

### 5. Launch J.A.R.V.I.S
Run the 1-click launcher:

```powershell
# Method A: Using Python runner (Starts backend & opens frontend)
python run_jarvis.py

# Method B: Or double-click start_jarvis.bat
.\start_jarvis.bat
```

Alternatively, you can run the backend and frontend separately:
- **Backend**: `cd jarvis_backend && python manage.py runserver 127.0.0.1:8000`
- **Frontend**: Open `frontend/index.html` with VS Code Live Server (`http://127.0.0.1:5500`) or double click `index.html`.

---

## Voice Interaction Guide

1. **Microphone Activation**:
   - Click the **Center Arc Reactor** or the **"VOICE COMMAND"** button at the bottom.
   - When prompted by your browser, click **"Allow"** for microphone access.
2. **Wake-Word Mode**:
   - With **Wake-Word Detector** enabled (default), simply speak aloud:
     - *"JARVIS, what time is it?"*
     - *"Hey JARVIS, tell me a joke."*
     - *"JARVIS, search the web for quantum mechanics."*
     - *"JARVIS, what is the status of the Mark VII armor?"*
3. **Continuous Listening**:
   - You can toggle continuous background listening on/off via the switch in the Left Panel.
4. **Speech Synthesis**:
   - JARVIS automatically speaks responses aloud using a refined UK/British persona. You can mute voice audio via the speaker icon in the top-right header or calibrate voice speed/pitch in Settings (`⚙ SETTINGS`).

---

## Supported Commands

### 1. Local Browser-Safe Commands
- **Current Time / Date**: *"What time is it?"*, *"What's the current date?"*
- **Clear Conversation**: *"Clear chat"*, *"Reset conversation"*
- **Mute / Stop**: *"Stop listening"*, *"Mute microphone"*
- **System Diagnostics**: *"Run diagnostics"*, *"System status"*
- **Launch Subsystems**: *"Open Calculator"*, *"Open Files"*, *"Open YouTube"*

### 2. Groq AI Generative Commands (Powered by Llama 3.3 70B)
- *"Explain the physics behind Tony Stark's Arc Reactor."*
- *"Help me write a Python script for WebSocket communication."*
- *"Tell me a witty joke about artificial intelligence."*
- *"What are the key differences between quantum computing and classical silicon?"*
- *Any general technical, conversational, or philosophical query.*

---

## REST API Reference

Base URL: `http://127.0.0.1:8000/api/`

### 1. `POST /api/chat/`
Send a text or voice transcription query to J.A.R.V.I.S.

**Request Payload:**
```json
{
  "message": "Good morning JARVIS, report system status.",
  "is_voice": true,
  "history": [
    {"sender": "user", "message": "Hello"},
    {"sender": "jarvis", "message": "Good day, Sir."}
  ]
}
```

**Response Payload:**
```json
{
  "success": true,
  "reply": "Good morning, Sir. All Mark VII diagnostic protocols are online and operating at maximum efficiency.",
  "timestamp": "2025-01-15T14:23:45Z",
  "response_time": 0.84,
  "model": "llama-3.3-70b-versatile",
  "action": "system_status",
  "action_data": {
    "cpu_percent": 24.5,
    "memory_percent": 48.2
  }
}
```

### 2. `GET /api/status/`
Health check endpoint returning real hardware telemetry (`psutil`), Groq connection readiness, and active model.

### 3. `GET /api/history/` & `POST /api/history/clear/`
Retrieve past message logs or purge conversation records from SQLite.

---

## Troubleshooting Guide

| Issue | Cause | Resolution |
|---|---|---|
| **Microphone not listening** | Browser microphone permissions blocked | Click the lock/tune icon in the browser URL bar, ensure **Microphone is set to Allow**, and refresh. |
| **"Microphone Unsupported"** | Using a browser without Web Speech API | Use **Google Chrome**, **Microsoft Edge**, or **Brave**. |
| **CORS Error in Console** | Frontend origin not whitelisted | Ensure Django `CORS_ALLOW_ALL_ORIGINS = True` or add your origin to `CORS_ALLOWED_ORIGINS` in `.env`. |
| **"Groq Auth Error"** | Missing or invalid API key | Create a free key at [console.groq.com](https://console.groq.com/keys) and paste it into `jarvis_backend/.env` as `GROQ_API_KEY=gsk_...`. |
| **Voice Audio Not Playing** | Voice synthesis muted or blocked | Click the speaker icon in the top-right header to unmute, or interact with the page once to satisfy browser autoplay policies. |

---

## Verification & Automated Testing

Run the automated backend test suite:

```powershell
python test_backend.py
```

Expected output:
```
========================================
J.A.R.V.I.S BACKEND VERIFICATION SUITE
========================================

[TEST 1] Checking GET /api/status/ ...
  ✓ Status Code: 200
  ✓ System: J.A.R.V.I.S Core System
  ✓ Version: Mark VII - v4.2
  ✓ Groq Model: llama-3.3-70b-versatile
  ✓ CPU Load: 22.4%

[TEST 2] Testing POST /api/chat/ ...
  ✓ Status Code: 200
  ✓ Success: True
  ✓ Response Time: 0.82s
  ✓ Model: llama-3.3-70b-versatile
  ✓ Reply: Good evening, Sir. All systems are online...

[TEST 3] Testing GET /api/history/ ...
  ✓ Status Code: 200
  ✓ Messages Count: 2

----------------------------------------
ALL TESTS PASSED SUCCESSFULLY! ✓✓✓
```

---

*Designed & Developed for Stark Industries Mark VII Architecture.*

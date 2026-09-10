#!/usr/bin/env python
"""
J.A.R.V.I.S Launch Script
Starts the Django backend and static frontend server concurrently.
"""
import os
import sys
import time
import subprocess
import webbrowser
from http.server import SimpleHTTPRequestHandler
import socketserver
import threading

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(ROOT_DIR, "jarvis_backend")
FRONTEND_DIR = os.path.join(ROOT_DIR, "frontend")
PYTHON_EXEC = sys.executable

def start_backend():
    print("[1/2] Starting J.A.R.V.I.S Django Backend on http://127.0.0.1:8000 ...")
    env = os.environ.copy()
    return subprocess.Popen(
        [PYTHON_EXEC, "manage.py", "runserver", "127.0.0.1:8000"],
        cwd=BACKEND_DIR,
        env=env
    )

def start_frontend(port=5500):
    class QuietHandler(SimpleHTTPRequestHandler):
        def log_message(self, format, *args):
            # Suppress noisy access logs
            pass
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=FRONTEND_DIR, **kwargs)

    print(f"[2/2] Starting J.A.R.V.I.S Command Center Frontend on http://127.0.0.1:{port} ...")
    socketserver.TCPServer.allow_reuse_address = True
    try:
        httpd = socketserver.TCPServer(("127.0.0.1", port), QuietHandler)
        thread = threading.Thread(target=httpd.serve_forever, daemon=True)
        thread.start()
        return httpd
    except OSError:
        print(f"Port {port} in use, trying port 5501...")
        return start_frontend(port=5501)

def main():
    print("=" * 65)
    print("   J.A.R.V.I.S — JUST A RATHER VERY INTELLIGENT SYSTEM")
    print("   Mark VII Command Center Initializing...")
    print("=" * 65)

    # 1. Start Django Backend
    backend_proc = start_backend()
    
    # Wait 1.5s for backend to spin up
    time.sleep(1.5)

    # 2. Start Frontend Server
    frontend_server = start_frontend(port=5500)
    
    frontend_url = "http://127.0.0.1:5500"
    print("\n" + "—" * 65)
    print(f"   ► SYSTEM READY, SIR.")
    print(f"   ► Dashboard URL:  {frontend_url}")
    print(f"   ► Backend API:    http://127.0.0.1:8000/api/")
    print(f"   ► Press CTRL+C to safely shutdown.")
    print("—" * 65 + "\n")

    # 3. Open in user's browser
    try:
        webbrowser.open(frontend_url)
    except Exception:
        pass

    try:
        backend_proc.wait()
    except KeyboardInterrupt:
        print("\nShutting down J.A.R.V.I.S subsystems...")
        backend_proc.terminate()
        frontend_server.shutdown()
        print("All systems offline.")

if __name__ == "__main__":
    main()

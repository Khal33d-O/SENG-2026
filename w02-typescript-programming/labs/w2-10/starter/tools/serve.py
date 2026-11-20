#!/usr/bin/env python3
"""SUPPLIED: start the owned local API, web server and collector.

    python3 tools/serve.py            (from starter, after npm run build; PORT overrides 4181)

* Serves index.html, events.html, styles.css, plan.json and dist/ on 127.0.0.1.
* Builds and starts the supplied .NET reference API (api/ReferenceApi, net10.0) on PORT+1000 and forwards
  GET /api/boards/* to it. If the .NET SDK is unavailable (or W210_API=python) it serves
  api/ReferenceApi/data/board-reference.json itself and says so.
* Local collector: POST /api/events stores one event in THIS process's memory (201 {"stored": n});
  GET /api/events lists them. Ctrl+C stops everything and discards the rows: save event text first.
This local view proves no BP or Grafana connection.
"""
import json
import os
import shutil
import signal
import subprocess
import sys
import threading
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = int(os.environ.get("PORT", "4181"))
API_PORT = PORT + 1000
HOST = "127.0.0.1"
TYPES = {".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
         ".map": "application/json", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8"}
EVENTS = []
LOCK = threading.Lock()
api_process = None
api_mode = "python-fallback"


def start_api():
    global api_process, api_mode
    dotnet = shutil.which("dotnet")
    if os.environ.get("W210_API") == "python" or dotnet is None:
        print("NOTE: .NET API not started; serving the reference file directly (local fallback).")
        return
    project = os.path.join(ROOT, "api", "ReferenceApi")
    out = os.path.join(ROOT, "api", "ReferenceApi", "bin", "serve")
    print("Building the supplied .NET reference API (first run can take a while)...")
    build = subprocess.run([dotnet, "build", project, "-o", out, "--nologo", "-v", "q"], cwd=project)
    if build.returncode != 0:
        print("WARNING: .NET build failed; using the local fallback for /api/boards/*.")
        return
    env = dict(os.environ, ASPNETCORE_URLS=f"http://{HOST}:{API_PORT}")
    api_process = subprocess.Popen([dotnet, os.path.join(out, "ReferenceApi.dll")], cwd=out, env=env,
                                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for _ in range(100):
        try:
            with urllib.request.urlopen(f"http://{HOST}:{API_PORT}/healthz", timeout=1) as r:
                if r.status == 200:
                    api_mode = "dotnet"
                    return
        except OSError:
            time.sleep(0.3)
    print("WARNING: the .NET API did not start; using the local fallback.")
    api_process.terminate()
    api_process = None


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):  # quieter console
        pass

    def send(self, status, body, ctype="application/json; charset=utf-8"):
        data = body if isinstance(body, bytes) else body.encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", ctype)
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_POST(self):
        if self.path.split("?")[0] != "/api/events":
            return self.send(404, '{"code":"NOT_FOUND"}')
        length = min(int(self.headers.get("Content-Length", "0")), 64_000)
        try:
            event = json.loads(self.rfile.read(length) or b"{}")
            assert isinstance(event.get("runId"), str) and isinstance(event.get("sequence"), int)
        except Exception:
            return self.send(400, '{"code":"INVALID_EVENT"}')
        event["receivedAt"] = datetime.now(timezone.utc).isoformat()
        with LOCK:
            EVENTS.append(event)
            count = len(EVENTS)
        self.send(201, json.dumps({"stored": count}))

    def do_GET(self):
        path = self.path.split("?")[0]
        if path == "/api/events":
            with LOCK:
                return self.send(200, json.dumps({"events": EVENTS}))
        if path.startswith("/api/boards/"):
            if api_mode == "dotnet":
                try:
                    with urllib.request.urlopen(f"http://{HOST}:{API_PORT}{path}", timeout=5) as r:
                        return self.send(r.status, r.read())
                except urllib.error.HTTPError as e:
                    return self.send(e.code, e.read())
            if path != "/api/boards/reference":
                return self.send(404, '{"code":"NOT_FOUND","message":"Board not found"}')
            with open(os.path.join(ROOT, "api", "ReferenceApi", "data", "board-reference.json"), "rb") as f:
                return self.send(200, f.read())
        if path == "/healthz":
            return self.send(200, "Healthy", "text/plain; charset=utf-8")
        rel = "index.html" if path in ("/", "") else path.lstrip("/")
        full = os.path.normpath(os.path.join(ROOT, rel))
        allowed = rel in ("index.html", "events.html", "styles.css", "plan.json") or rel.startswith("dist/")
        if not allowed or not full.startswith(ROOT) or not os.path.isfile(full):
            return self.send(404, "Not found", "text/plain; charset=utf-8")
        with open(full, "rb") as f:
            self.send(200, f.read(), TYPES.get(os.path.splitext(full)[1], "application/octet-stream"))


def main():
    sys.stdout.reconfigure(line_buffering=True)
    signal.signal(signal.SIGTERM, lambda *_: (_ for _ in ()).throw(KeyboardInterrupt()))
    if not os.path.isfile(os.path.join(ROOT, "dist", "app.js")):
        sys.exit("dist/app.js is missing: run npm run build first.")
    start_api()
    try:
        server = ThreadingHTTPServer((HOST, PORT), Handler)
    except OSError:
        if api_process:
            api_process.terminate()
        sys.exit(f"Port {PORT} is in use: stop the other server or set PORT.")
    print(f"OPEN http://{HOST}:{PORT}/   (add ?plan=A, ?plan=B or ?plan=C for a supplied comparison)")
    print("Reference API:", "supplied .NET API" if api_mode == "dotnet" else "local fallback (file)")
    print("Event rows live in this process's memory. Ctrl+C stops the server and the API.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
        if api_process:
            api_process.terminate()


if __name__ == "__main__":
    main()

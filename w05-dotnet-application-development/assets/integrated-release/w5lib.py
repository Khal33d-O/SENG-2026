"""Shared helpers for the Week 5 integrated-release tools (run.py, release.py). Standard library only."""
import atexit
import json
import os
import shutil
import signal
import socket
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request

PACKAGE = os.path.dirname(os.path.abspath(__file__))
SOURCE = os.path.join(PACKAGE, "source")
UNIT = os.path.dirname(os.path.dirname(PACKAGE))
IGNORE = shutil.ignore_patterns("bin", "obj", "publish", "node_modules", "*.db", "*.db-shm", "*.db-wal",
                                "__pycache__", ".git")
IS_WINDOWS = os.name == "nt"


def say(message):
    print(message, flush=True)


def fail(message, code=1):
    say(f"FAIL {message}")
    sys.exit(code)


def new_workspace(path):
    """Test runs need a new directory: earlier evidence is never deleted or reused."""
    path = os.path.abspath(path)
    if os.path.exists(path) and (not os.path.isdir(path) or os.listdir(path)):
        fail(f"{path} already exists. Use a new --workspace path; earlier evidence is preserved.")
    os.makedirs(path, exist_ok=True)
    return path


def free_port():
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def short_build_dir():
    """Build trees go in a short temporary path (Windows MAX_PATH) and are removed at exit;
    logs, databases and records stay in the workspace."""
    path = tempfile.mkdtemp(prefix="w5b-")
    atexit.register(shutil.rmtree, path, True)
    return os.path.join(path, "src")


def copy_source(src, dest):
    if os.path.isdir(dest):
        shutil.rmtree(dest)
    shutil.copytree(src, dest, ignore=IGNORE)
    return dest


def run(cmd, cwd=None, env=None, log=None, check=True):
    """Run a command to completion; output goes to `log` (appended) and is returned."""
    result = subprocess.run(cmd, cwd=cwd, env=env, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if log:
        with open(log, "a", encoding="utf-8") as fh:
            fh.write(f"$ {' '.join(cmd)}\n{result.stdout}{result.stderr}\nexit {result.returncode}\n")
    if check and result.returncode != 0:
        say((result.stdout + result.stderr)[-4000:])
        fail(f"command failed (exit {result.returncode}): {' '.join(cmd)}")
    return result


def build(src, log):
    """Restore and build the whole solution (rules, API, fixture tests and HTTP runner)."""
    say(f"build: dotnet build {os.path.join(src, 'Academy.slnx')} -c Release (log: {log})")
    run(["dotnet", "build", "Academy.slnx", "-c", "Release"], cwd=src, log=log)


def api_dll(src):
    return os.path.join(src, "Api", "bin", "Release", "net10.0", "Api.dll")


def tests_dll(src):
    return os.path.join(src, "Tests", "bin", "Release", "net10.0", "Tests.dll")


class Processes:
    """Starts background processes and always stops them (used in `with` blocks / finally)."""

    def __init__(self):
        self.items = []

    def start(self, name, cmd, cwd, env, log_path):
        log = open(log_path, "a", encoding="utf-8")
        flags = subprocess.CREATE_NEW_PROCESS_GROUP if IS_WINDOWS else 0
        proc = subprocess.Popen(cmd, cwd=cwd, env=env, stdout=log, stderr=subprocess.STDOUT,
                                creationflags=flags, start_new_session=not IS_WINDOWS)
        self.items.append((name, proc, log))
        return proc

    def stop(self, name=None):
        keep = []
        for item in self.items:
            n, proc, log = item
            if name and n != name:
                keep.append(item)
                continue
            if proc.poll() is None:
                proc.terminate()
                try:
                    proc.wait(timeout=15)
                except subprocess.TimeoutExpired:
                    proc.kill()
            log.close()
        self.items = keep

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        self.stop()
        return False


def http(method, url, body=None, raw=None, headers=None, timeout=20):
    """One HTTP request; returns (status, headers, parsed JSON or text). 4xx/5xx do not raise."""
    data = raw.encode() if raw is not None else (json.dumps(body).encode() if body is not None else None)
    req = urllib.request.Request(url, data=data, method=method)
    if data is not None:
        req.add_header("Content-Type", "application/json")
    for k, v in (headers or {}).items():
        req.add_header(k, v)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            status, hdrs, text = r.status, dict(r.headers), r.read().decode()
    except urllib.error.HTTPError as e:
        status, hdrs, text = e.code, dict(e.headers), e.read().decode()
    try:
        return status, hdrs, json.loads(text) if text else None
    except json.JSONDecodeError:
        return status, hdrs, text


def wait_ready(url, seconds=90, proc=None):
    deadline = time.time() + seconds
    while time.time() < deadline:
        if proc is not None and proc.poll() is not None:
            return False
        try:
            status, _, _ = http("GET", url, timeout=3)
            if status == 200:
                return True
        except (urllib.error.URLError, ConnectionError, TimeoutError, OSError):
            pass
        time.sleep(0.5)
    return False


def write_json(path, value):
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(value, fh, indent=2)
        fh.write("\n")


def read_json(path):
    with open(path, encoding="utf-8") as fh:
        return json.load(fh)


def which_or_fail(tool, hint):
    if shutil.which(tool) is None:
        fail(f"'{tool}' is not on PATH. {hint}")


def wait_forever(message):
    """Keep services running until Ctrl+C."""
    say(message)
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        say("\nStopping (Ctrl+C) ...")


def install_sigterm():
    """Treat SIGTERM like Ctrl+C so `finally` blocks stop child processes."""
    def interrupt(*_):
        raise KeyboardInterrupt()

    for name in ("SIGTERM", "SIGBREAK"):  # SIGBREAK: Ctrl+Break on Windows
        if hasattr(signal, name):
            try:
                signal.signal(getattr(signal, name), interrupt)
            except (ValueError, OSError):
                pass

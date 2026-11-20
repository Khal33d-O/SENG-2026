"""W1.06 supplied launcher: one API container and one replaceable frontend on a prepared network.

Run from the lab's code/ folder. Relative --settings paths are interpreted from code/.
  python3 lab.py prepare                          facilitator: build localhost/academy-w106:10.0.12
  python3 lab.py up --settings FILE [--port 4316] start/keep the API, REPLACE the frontend with FILE
  python3 lab.py probe --from api|frontend --url URL   run an HTTP request INSIDE the selected container
  python3 lab.py check                            request the configured browser route from this host
  python3 lab.py stop-api / start-api             stop or restart only the supplied API container
  python3 lab.py down                             remove only this workspace's containers and network

Engine: LAB_ENGINE (default podman). Every engine command is printed.
"""

import argparse
import json
import os
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
ENGINE = os.environ.get("LAB_ENGINE", "podman")
IMAGE = os.environ.get("LAB_IMAGE", "localhost/academy-w106:10.0.12")
NETWORK, API, FRONTEND = "w106-net", "w106-api", "w106-frontend"
LABEL = "academy.module=w1-06"
STATE = HERE / ".w106-state.json"
KEYS = ("API_UPSTREAM", "BROWSER_API_URL", "PUBLIC_LABEL")


def run(args, show=True):
    cmd = [ENGINE, *args]
    if show:
        print("$ " + " ".join(cmd))
    try:
        r = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    except FileNotFoundError:
        print(f"PREPARATION REQUIRED: engine '{ENGINE}' not found (set LAB_ENGINE or ask the facilitator)."); raise SystemExit(4)
    out = r.stdout.decode("utf-8", "replace").rstrip()
    if show and out:
        print("  " + out.replace("\n", "\n  "))
    return r.returncode, out


def exists(name):
    return run(["container", "exists", name], show=False)[0] == 0 if ENGINE == "podman" else \
        run(["inspect", name], show=False)[0] == 0


def read_settings(path):
    p = Path(path) if Path(path).is_absolute() else HERE / path
    values = {}
    for number, line in enumerate(p.read_text(encoding="utf-8").splitlines(), 1):
        if not line.strip() or line.startswith("#"):
            continue
        if "=" not in line or line.split("=", 1)[0] != line.split("=", 1)[0].strip():
            print(f"SETTINGS ERROR {path}:{number}: use KEY=value with no spaces around ="); raise SystemExit(2)
        key, value = line.split("=", 1)
        values[key] = value
    if sorted(values) != sorted(KEYS):
        print(f"SETTINGS ERROR {path}: expected exactly {', '.join(KEYS)}; found {', '.join(values)}"); raise SystemExit(2)
    return p, values


def http_get(url):
    try:
        with urllib.request.urlopen(url, timeout=4) as r:
            return r.status, r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", "replace")
    except (urllib.error.URLError, OSError) as e:
        return None, str(getattr(e, "reason", e))


def probe(source, url, show=True):
    container = API if source == "api" else FRONTEND
    code, out = run(["exec", container, "dotnet", "/app/Relay.dll", "probe", url], show=show)
    if show:
        print(f"exit {code} (caller: {source} container {container})")
    return code, out


def ensure_api():
    if run(["network", "exists", NETWORK], show=False)[0] != 0 if ENGINE == "podman" else \
            run(["network", "inspect", NETWORK], show=False)[0] != 0:
        run(["network", "create", "--label", LABEL, NETWORK])
    if not exists(API):
        run(["run", "--detach", "--name", API, "--label", LABEL, "--network", NETWORK, "--network-alias", "api",
             "--env", "LAB_ROLE=api", "--env", "ASPNETCORE_URLS=http://0.0.0.0:8181", IMAGE])
    else:
        run(["start", API])


def wait_for(url, seconds=20):
    end = time.time() + seconds
    while time.time() < end:
        if http_get(url)[0] is not None:
            return True
        time.sleep(0.5)
    return False


def cmd_prepare(_a):
    code, _ = run(["build", "-t", IMAGE, "-f", str(HERE / "supplied-runtime" / "Containerfile"), str(HERE / "supplied-runtime")])
    return code


def cmd_up(a):
    if run(["image", "inspect", IMAGE], show=False)[0] != 0:
        print(f"PREPARATION REQUIRED: image {IMAGE} is missing (facilitator: python3 lab.py prepare)."); return 4
    path, values = read_settings(a.settings)
    ensure_api()
    if exists(FRONTEND):
        run(["rm", "--force", FRONTEND])
    code, _ = run(["run", "--detach", "--name", FRONTEND, "--label", LABEL, "--network", NETWORK,
                   "--env-file", str(path), "--env", "LAB_ROLE=frontend", "--env", "ASPNETCORE_URLS=http://0.0.0.0:8080",
                   "--publish", f"127.0.0.1:{a.port}:8080", IMAGE])
    if code != 0:
        print("The frontend could not start (is the host port occupied? ask for --port 4317)."); return 1
    url = f"http://127.0.0.1:{a.port}/"
    STATE.write_text(json.dumps({"port": a.port, "settings": str(a.settings)}) + "\n", encoding="utf-8")
    if not wait_for(url):
        print("The frontend did not answer in time; read: " + f"{ENGINE} logs {FRONTEND}"); return 1
    time.sleep(1)
    print("Fixed alias probe (readiness of the supplied network, independent of your settings):")
    code, _ = probe("frontend", "http://api:8181/healthz")
    if code != 0:
        print("PREPARATION REQUIRED: the frontend cannot reach the fixed alias api:8181. Ask the facilitator to "
              "restore the prepared network/DNS helper. Do not copy an allocated IP into your settings."); return 4
    print(f"READY {url}  (settings {a.settings}; label {values['PUBLIC_LABEL']})")
    return 0


def cmd_probe(a):
    code, _ = probe(a.source, a.url)
    return code


def cmd_check(_a):
    if not STATE.is_file():
        print("No running workspace recorded; run up first."); return 2
    state = json.loads(STATE.read_text(encoding="utf-8"))
    origin = f"http://127.0.0.1:{state['port']}"
    status, body = http_get(origin + "/public-config")
    if status != 200:
        print(f"FAIL frontend page origin {origin} did not answer /public-config ({status})"); return 1
    cfg = json.loads(body)
    target = urllib.parse.urljoin(origin + "/", cfg["browserApiUrl"])
    same = urllib.parse.urlsplit(target)[:2] == urllib.parse.urlsplit(origin)[:2]
    print(f"settings {state['settings']}; label {cfg['publicLabel']}")
    print(f"configured browser route: {target} ({'same origin' if same else 'DIFFERENT origin: the browser adapter (mode same-origin) gets no HTTP response'})")
    status, body = http_get(target)
    print(f"GET {target} -> " + (f"HTTP {status}" if status else f"NO HTTP RESPONSE ({body})"))
    if status:
        print("  " + body[:300])
    ok = False
    if same and status == 200:
        try:
            data = json.loads(body)
            b = data.get("board", {})
            ok = (data.get("service") == "w106-reference-api" and b.get("id") == "reference"
                  and b.get("width") == 3 and b.get("height") == 3 and b.get("initialMoves") == 6)
        except json.JSONDecodeError:
            ok = False
    print("RESULT: " + ("PASS (API identity and reference fields through the configured route; this is not a browser click)"
                        if ok else "FAIL"))
    return 0 if ok else 1


def cmd_stop_api(_a):
    return run(["stop", API])[0]


def cmd_start_api(_a):
    code, _ = run(["start", API])
    return code


def cmd_down(_a):
    for name in (FRONTEND, API):
        if exists(name):
            run(["rm", "--force", name])
    run(["network", "rm", NETWORK])
    if STATE.exists():
        STATE.unlink()
    return 0


def main():
    p = argparse.ArgumentParser(description="W1.06 launcher")
    sub = p.add_subparsers(dest="cmd", required=True)
    s = sub.add_parser("up"); s.add_argument("--settings", required=True); s.add_argument("--port", type=int, default=4316)
    s = sub.add_parser("probe"); s.add_argument("--from", dest="source", choices=["api", "frontend"], required=True)
    s.add_argument("--url", required=True)
    for name in ("prepare", "check", "stop-api", "start-api", "down"):
        sub.add_parser(name)
    a = p.parse_args()
    return {"prepare": cmd_prepare, "up": cmd_up, "probe": cmd_probe, "check": cmd_check, "stop-api": cmd_stop_api,
            "start-api": cmd_start_api, "down": cmd_down}[a.cmd](a)


if __name__ == "__main__":
    sys.exit(main())

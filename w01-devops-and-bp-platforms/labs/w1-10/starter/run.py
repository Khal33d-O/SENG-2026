"""W1.10 supplied helper: prepare a workspace, run smoke checks, correlate a request in Loki/Grafana.

Run from the W1.10 lab directory:
  python3 starter/run.py prepare DEST                 publish the supplied app, start it + local Loki/Grafana (DEST must be new)
  python3 starter/run.py fixtures                     print the supplied fixtures and caller contract
  python3 starter/run.py browser DEST FIXTURE --expect received|http-error|unavailable [--environment NAME]
  python3 starter/run.py query DEST last-request|REQUEST_ID
  python3 starter/run.py grafana DEST last-request|REQUEST_ID
  python3 starter/run.py backup DEST                  new saved/<timestamp>/ with client.json, runtime.env (+ last observation)
  python3 starter/run.py apply DEST                   validate both files, restart the SAME compiled DLL, serve client.json
  python3 starter/run.py stop DEST                    stop this workspace's process and named containers only

Browser checks use Chromium through Python Playwright when it is installed (facilitator-prepared). Otherwise the helper
uses an EMULATED CLIENT that applies the same client.json rules (per-attempt complete-body deadline, retries after an
unavailable result) and labels every result "emulated client (no Chromium)".
The helper never downloads images: Loki and Grafana must already be present in the engine (LAB_ENGINE, default podman).
"""

import argparse
import datetime as dt
import hashlib
import http.client
import json
import os
import re
import secrets
import shutil
import signal
import socket
import subprocess
import sys
import threading
import time
import urllib.parse
import urllib.request
import uuid
from pathlib import Path

sys.dont_write_bytecode = True
LAB = Path(__file__).resolve().parents[1]
APP_SOURCE = LAB.parents[1] / "projects" / "code" / "app"
ENGINE = os.environ.get("LAB_ENGINE", "podman")
LOKI_IMAGE = "docker.io/grafana/loki:3.7.8"
GRAFANA_IMAGE = "docker.io/grafana/grafana:13.2.3"
RELEASE = "foundation-observe-a"
BOARD = json.loads((LAB / "starter" / "board-reference.json").read_text(encoding="utf-8"))
FIXTURES = {"reference": "200 board immediately", "missing": "404 NOT_FOUND", "slow": "200 board after 300 ms server processing",
            "overdue": "200 board after 900 ms server processing (beyond every admissible caller budget)"}
RECEIPT_ALLOWANCE_MS = 750


def now(fmt="%Y-%m-%dT%H:%M:%SZ"):
    return dt.datetime.now(dt.timezone.utc).strftime(fmt)


def free_port(start):
    for port in range(start, start + 50):
        with socket.socket() as s:
            try:
                s.bind(("127.0.0.1", port))
                return port
            except OSError:
                continue
    raise SystemExit("no free port found")


def engine(*args, check=False, show=True):
    if show:
        print("$ " + " ".join([ENGINE, *args]))
    try:
        r = subprocess.run([ENGINE, *args], stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    except FileNotFoundError:
        return 127, "engine not found"
    out = r.stdout.decode("utf-8", "replace").strip()
    if check and r.returncode != 0:
        raise SystemExit(f"engine command failed: {out}")
    return r.returncode, out


def ws_state(dest):
    p = Path(dest) / "workspace.json"
    if not p.is_file():
        raise SystemExit(f"{dest} is not a prepared W1.10 workspace (run prepare with a NEW destination).")
    return json.loads(p.read_text(encoding="utf-8"))


def save_state(dest, st):
    (Path(dest) / "workspace.json").write_text(json.dumps(st, indent=2) + "\n", encoding="utf-8")


def sha_file(p):
    return hashlib.sha256(Path(p).read_bytes()).hexdigest()


# ---------------------------------------------------------------- configuration
def read_env_file(path):
    values = {}
    for line in Path(path).read_text(encoding="utf-8").splitlines():
        if line.strip() and not line.startswith("#"):
            key, _, value = line.partition("=")
            values[key] = value
    return values


def validate(dest):
    errors = []
    try:
        c = json.loads((Path(dest) / "client.json").read_text(encoding="utf-8"))
        d, r = c.get("deadlineMs"), c.get("retries")
        if not (isinstance(d, int) and not isinstance(d, bool) and 40 <= d <= 650):
            errors.append("deadlineMs must be an integer 40-650")
        if not (isinstance(r, int) and not isinstance(r, bool) and 0 <= r <= 2):
            errors.append("retries must be an integer 0-2")
        if not errors and d * (r + 1) > 650:
            errors.append(f"total configured budget deadlineMs x (retries + 1) = {d * (r + 1)} exceeds 650 ms")
        if set(c) - {"deadlineMs", "retries"}:
            errors.append("client.json may contain only deadlineMs and retries")
    except (OSError, json.JSONDecodeError) as exc:
        errors.append(f"client.json unreadable: {exc}")
    try:
        env = read_env_file(Path(dest) / "runtime.env")
        if env.get("LAB_ENV") not in ("workshop-blue", "workshop-green") or set(env) != {"LAB_ENV"}:
            errors.append("runtime.env must contain exactly LAB_ENV=workshop-blue or LAB_ENV=workshop-green")
    except OSError as exc:
        errors.append(f"runtime.env unreadable: {exc}")
    return errors


# ---------------------------------------------------------------- process control
def start_app(dest, st):
    env = dict(os.environ, ASPNETCORE_URLS=f"http://127.0.0.1:{st['port']}", LAB_SESSION=st["session"],
               **read_env_file(Path(dest) / "runtime.env"))
    if st.get("loki_port"):
        env["LOCAL_LOKI_URL"] = f"http://127.0.0.1:{st['loki_port']}"
    shutil.copy2(Path(dest) / "client.json", Path(dest) / "app-bin" / "wwwroot" / "client.json")
    log = open(Path(dest) / "app.log", "a", encoding="utf-8")
    kwargs = {"creationflags": 0x00000008 | 0x00000200} if os.name == "nt" else {"start_new_session": True}
    proc = subprocess.Popen(["dotnet", str(Path(dest) / "app-bin" / "Foundation.dll")], env=env, stdout=log,
                            stderr=subprocess.STDOUT, cwd=str(Path(dest) / "app-bin"), **kwargs)
    st["pid"] = proc.pid
    for _ in range(60):
        try:
            with urllib.request.urlopen(f"http://127.0.0.1:{st['port']}/healthz", timeout=1) as r:
                if r.status == 200:
                    return True
        except OSError:
            time.sleep(0.5)
    return False


def stop_app(st):
    pid = st.get("pid")
    if not pid:
        return
    try:
        if os.name == "nt":
            subprocess.run(["taskkill", "/PID", str(pid), "/T", "/F"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        else:
            os.killpg(pid, signal.SIGTERM)
    except (OSError, ProcessLookupError):
        pass
    st["pid"] = None
    time.sleep(1)


# ---------------------------------------------------------------- commands
def cmd_prepare(a):
    dest = Path(a.dest).resolve()
    if dest.exists():
        print(f"REFUSED: {dest} already exists; use a fresh destination so earlier work is never overwritten."); return 2
    dest.mkdir(parents=True)
    session = "w110-" + re.sub(r"[^a-z0-9-]", "-", dest.name.lower())[:30] + "-" + secrets.token_hex(2)
    print(f"publishing the supplied application from {APP_SOURCE}")
    shutil.copytree(APP_SOURCE, dest / "src", ignore=shutil.ignore_patterns("bin", "obj", "publish"))
    r = subprocess.run(["dotnet", "publish", str(dest / "src" / "Foundation.csproj"), "-c", "Release", "-o", str(dest / "app-bin"),
                        "--nologo"], stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    if r.returncode != 0:
        print(r.stdout.decode()[-2000:]); print("PREPARATION FAILED: dotnet publish"); return 4
    shutil.copy2(LAB / "starter" / "client.json", dest / "client.json")
    shutil.copy2(LAB / "starter" / "runtime.env", dest / "runtime.env")
    st = {"session": session, "port": free_port(4100), "created": now(), "dll_sha256": sha_file(dest / "app-bin" / "Foundation.dll"),
          "loki_port": None, "grafana_port": None, "containers": []}
    # Observation services: refuse to download; use them only when the prepared images are present.
    have = all(engine("image", "exists" if ENGINE == "podman" else "inspect", img, show=False)[0] == 0 for img in (LOKI_IMAGE, GRAFANA_IMAGE))
    if have:
        st["loki_port"], st["grafana_port"] = free_port(3100), free_port(3000)
        net = f"{session}-net"
        engine("network", "create", net)
        loki, graf = f"{session}-loki", f"{session}-grafana"
        engine("run", "-d", "--name", loki, "--network", net, "--network-alias", "loki", "-p", f"127.0.0.1:{st['loki_port']}:3100", LOKI_IMAGE)
        engine("run", "-d", "--name", graf, "--network", net, "-p", f"127.0.0.1:{st['grafana_port']}:3000",
               "-e", "GF_AUTH_ANONYMOUS_ENABLED=true", "-e", "GF_AUTH_ANONYMOUS_ORG_ROLE=Admin", "-e", "GF_AUTH_DISABLE_LOGIN_FORM=true",
               "-v", f"{LAB / 'observability' / 'grafana-provisioning'}:/etc/grafana/provisioning:ro", GRAFANA_IMAGE)
        st["containers"], st["network"] = [loki, graf], net
        for _ in range(90):  # Loki readiness
            try:
                with urllib.request.urlopen(f"http://127.0.0.1:{st['loki_port']}/ready", timeout=1) as resp:
                    if resp.status == 200:
                        break
            except OSError:
                time.sleep(1)
    else:
        print("OBSERVATION SERVICES UNAVAILABLE: Loki/Grafana images are not prepared (this helper never downloads).")
        print("Records still go to app.log (stdout). Ask the facilitator; do not count this as the challenge failure.")
    if not start_app(dest, st):
        save_state(dest, st); print("PREPARATION FAILED: application did not answer /healthz; see app.log"); return 4
    save_state(dest, st)
    print(f"READY application http://127.0.0.1:{st['port']}/   session {session}")
    if st["grafana_port"]:
        print(f"      Grafana http://127.0.0.1:{st['grafana_port']}/d/w110-requests   Loki http://127.0.0.1:{st['loki_port']}")
    return 0


def cmd_fixtures(_a):
    print("Supplied fixtures (server side):")
    for k, v in FIXTURES.items():
        print(f"  {k:9} {v}")
    print("Caller contract: deadlineMs 40-650 per attempt (complete body); retries 0-2 after an unavailable result;")
    print(f"deadlineMs x (retries + 1) <= 650 ms; slow-board receipt must occur within {RECEIPT_ALLOWANCE_MS} ms;")
    print("a received HTTP error ends the action and is not retried.")
    return 0


def emulated_attempt(port, fixture, action_id, deadline_ms):
    """One HTTP attempt with a complete-body deadline, like the page's AbortController."""
    request_id = str(uuid.uuid4())
    result = {"request_id": request_id}
    box = {}

    def go():
        try:
            conn = http.client.HTTPConnection("127.0.0.1", port, timeout=5)
            box["conn"] = conn
            conn.request("GET", f"/api/boards/{fixture}", headers={"X-Request-Id": request_id, "X-Action-Id": action_id})
            resp = conn.getresponse()
            box["body"] = resp.read()
            box["status"], box["headers"] = resp.status, dict(resp.getheaders())
        except Exception as exc:  # noqa: BLE001 - any transport failure means no complete response
            box["error"] = type(exc).__name__

    started = time.perf_counter()
    t = threading.Thread(target=go, daemon=True)
    t.start()
    t.join(deadline_ms / 1000)
    elapsed = round((time.perf_counter() - started) * 1000)
    if t.is_alive() or "status" not in box:
        if "conn" in box:
            try:
                box["conn"].sock.shutdown(socket.SHUT_RDWR)   # abort, as the browser does
            except Exception:  # noqa: BLE001
                pass
        result.update(received=False, status=None, error=box.get("error", "AbortError"), elapsed_ms=elapsed)
        return result, None
    h = {k.lower(): v for k, v in box["headers"].items()}
    result.update(received=True, status=box["status"], echoed_request_id=h.get("x-request-id"), release=h.get("x-lab-release"),
                  environment=h.get("x-lab-environment"), elapsed_ms=elapsed)
    return result, box["body"].decode("utf-8", "replace")


def browser_emulated(dest, st, fixture):
    client = json.loads((Path(dest) / "app-bin" / "wwwroot" / "client.json").read_text(encoding="utf-8"))  # served copy
    action_id = str(uuid.uuid4())
    started = time.perf_counter()
    attempts, final, body = [], None, None
    for _ in range(client["retries"] + 1):
        res, text = emulated_attempt(st["port"], fixture, action_id, client["deadlineMs"])
        attempts.append(res)
        if res["received"]:
            final, body = res, text
            break
    obs = {"action_id": action_id, "fixture": fixture, "client": client, "browser": "emulated client (no Chromium)",
           "outcome": ("received" if final["status"] < 400 else "http-error") if final else "unavailable",
           "received_status": final["status"] if final else None,
           "echoed_request_id": final.get("echoed_request_id") if final else None,
           "release": final.get("release") if final else None, "environment": final.get("environment") if final else None,
           "action_elapsed_ms": round((time.perf_counter() - started) * 1000), "attempts": attempts}
    return obs, body


def browser_chromium(st, fixture, evidence):
    from playwright.sync_api import sync_playwright  # facilitator-prepared; optional
    with sync_playwright() as p:
        b = p.chromium.launch()
        page = b.new_page()
        page.goto(f"http://127.0.0.1:{st['port']}/")
        page.wait_for_function("document.getElementById('config').textContent.startsWith('{')")
        page.select_option("#board", fixture)
        page.click("#load")
        page.wait_for_function("window.lastObservation !== undefined", timeout=10000)
        obs = page.evaluate("window.lastObservation")
        body = page.text_content("#body") if obs.get("outcome") != "unavailable" else None
        page.screenshot(path=str(evidence / "browser.png"), full_page=True)
        b.close()
    obs["browser"] = "Chromium (Playwright)"
    return obs, body


def cmd_browser(a):
    dest = Path(a.dest).resolve()
    st = ws_state(dest)
    evidence = dest / "evidence" / f"{now('%Y%m%dT%H%M%SZ')}-{a.fixture}-{secrets.token_hex(2)}"
    evidence.mkdir(parents=True)
    try:
        import playwright  # noqa: F401
        obs, body = browser_chromium(st, a.fixture, evidence)
    except ImportError:
        obs, body = browser_emulated(dest, st, a.fixture)
    obs["recorded"] = now()
    (evidence / "observation.json").write_text(json.dumps(obs, indent=2) + "\n", encoding="utf-8")
    if body is not None:
        (evidence / "received-body.txt").write_text(body, encoding="utf-8")
    shutil.copy2(evidence / "observation.json", dest / "last-observation.json")
    try:
        with urllib.request.urlopen(f"http://127.0.0.1:{st['port']}/healthz", timeout=3) as r:
            health = (r.status, r.read().decode())
    except OSError as exc:
        health = (None, str(exc))
    print(json.dumps(obs, indent=2))
    print(f"health: {health[0]} {health[1]}")
    env = a.environment or "workshop-blue"
    checks = []

    def c(ok, label):
        checks.append(ok); print(("PASS " if ok else "FAIL ") + label)

    c(obs["outcome"] == a.expect, f"outcome is {a.expect} (actual {obs['outcome']})")
    if a.expect == "received":
        try:
            same = json.loads(body) == BOARD
        except (TypeError, json.JSONDecodeError):
            same = False
        c(obs["received_status"] == 200 and same, "received HTTP 200 with the 3x3 reference board and six initial moves")
        c(obs["release"] == RELEASE, f"release {RELEASE}")
        c(obs["environment"] == env, f"environment {env} (actual {obs['environment']})")
        c(obs["echoed_request_id"] == obs["attempts"][-1]["request_id"], "echoed request ID matches the sent attempt")
        if a.fixture == "slow":
            c(obs["outcome"] == "received" and obs["action_elapsed_ms"] <= RECEIPT_ALLOWANCE_MS, f"slow receipt within {RECEIPT_ALLOWANCE_MS} ms (actual {obs['action_elapsed_ms']} ms)")
    elif a.expect == "http-error":
        try:
            code = json.loads(body).get("code")
        except (TypeError, json.JSONDecodeError, AttributeError):
            code = None
        c(obs["received_status"] == 404 and code == "NOT_FOUND", "received HTTP 404 with code NOT_FOUND")
        c(obs["environment"] == env, f"environment {env} (actual {obs['environment']})")
    else:
        c(obs["received_status"] is None, "no complete response was received (bounded unavailable outcome)")
        c(obs["action_elapsed_ms"] <= RECEIPT_ALLOWANCE_MS, f"action ended within {RECEIPT_ALLOWANCE_MS} ms (actual {obs['action_elapsed_ms']} ms)")
    c(health[0] == 200 and health[1] == "Healthy", "health route returns 200 Healthy (narrow liveness)")
    ok = all(checks)
    print(f"evidence directory: {evidence}")
    print("RESULT: " + ("PASS" if ok else "FAIL") + f" ({obs['browser']})")
    return 0 if ok else 1


def target_id(dest, which):
    if which != "last-request":
        return which
    p = Path(dest) / "last-observation.json"
    if not p.is_file():
        raise SystemExit("No last observation yet: run a browser check first.")
    return json.loads(p.read_text(encoding="utf-8"))["attempts"][-1]["request_id"]


def loki_query(st, rid):
    q = f'{{job="academy-w110", session="{st["session"]}"}} |= "{rid}"'
    start = int((time.time() - 3600) * 1e9)
    url = f"http://127.0.0.1:{st['loki_port']}/loki/api/v1/query_range?" + urllib.parse.urlencode(
        {"query": q, "start": start, "limit": 20, "direction": "backward"})
    with urllib.request.urlopen(url, timeout=5) as r:
        return q, json.loads(r.read())


def cmd_query(a):
    dest = Path(a.dest).resolve()
    st = ws_state(dest)
    rid = target_id(dest, a.which)
    out = dest / "evidence" / f"query-{now('%Y%m%dT%H%M%SZ')}-{rid[:8]}.json"
    out.parent.mkdir(exist_ok=True)
    if st.get("loki_port"):
        rows = []
        for _ in range(10):  # wait for the recorder (slow/overdue complete after the caller stops)
            q, raw = loki_query(st, rid)
            rows = [v[1] for s in raw["data"]["result"] for v in s["values"]]
            if rows:
                break
            time.sleep(1)
        out.write_text(json.dumps(raw, indent=2) + "\n", encoding="utf-8")
        print(f"Loki query: {q}")
        print(f"raw Loki response saved: {out}")
        if not rows:
            print("LOCAL_RECORD_UNAVAILABLE: no matching row in Loki for this session/time range/identifier yet. Check the "
                  "workspace, identifier, interval and delivery warnings in app.log before concluding no request ran.")
            return 1
        for row in rows:
            print(json.dumps(json.loads(row), indent=2))
        return 0
    lines = [l for l in (dest / "app.log").read_text(encoding="utf-8", errors="replace").splitlines() if rid in l]
    print("Loki/Grafana are not prepared: showing the application's STDOUT record (not a Grafana/Loki observation).")
    out.write_text(json.dumps({"source": "stdout app.log", "lines": lines}, indent=2) + "\n", encoding="utf-8")
    for l in lines:
        print(l)
    return 0 if lines else 1


def cmd_grafana(a):
    dest = Path(a.dest).resolve()
    st = ws_state(dest)
    rid = target_id(dest, a.which)
    if not st.get("grafana_port"):
        print("Grafana is not prepared in this workspace (observation services unavailable)."); return 4
    base = f"http://127.0.0.1:{st['grafana_port']}"
    url = f"{base}/d/w110-requests/w110-requests?" + urllib.parse.urlencode(
        {"var-session": st["session"], "var-request": rid, "from": "now-1h", "to": "now"})
    body = json.dumps({"queries": [{"refId": "A", "datasource": {"uid": "loki"},
                                    "expr": f'{{job="academy-w110", session="{st["session"]}"}} |= "{rid}"'}],
                       "from": "now-1h", "to": "now"}).encode()
    ds, count = {}, 0
    for _ in range(15):  # Grafana and its datasource may still be starting; retry briefly
        req = urllib.request.Request(base + "/api/ds/query", data=body, headers={"Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=10) as r:
                ds = json.loads(r.read())
        except OSError as exc:
            ds = {"error": str(exc)}
        frames = ds.get("results", {}).get("A", {}).get("frames", [])
        count = sum(len((f.get("data", {}).get("values") or [[]])[0]) for f in frames)
        if count:
            break
        time.sleep(2)
    out = dest / "evidence" / f"grafana-{now('%Y%m%dT%H%M%SZ')}-{rid[:8]}"
    out.mkdir(parents=True)
    (out / "dashboard-url.txt").write_text(url + "\n", encoding="utf-8")
    (out / "datasource-response.json").write_text(json.dumps(ds, indent=2) + "\n", encoding="utf-8")
    try:
        from playwright.sync_api import sync_playwright
        with sync_playwright() as p:
            b = p.chromium.launch(); pg = b.new_page(viewport={"width": 1400, "height": 900})
            pg.goto(url); pg.wait_for_timeout(4000); pg.screenshot(path=str(out / "dashboard.png")); b.close()
        shot = "dashboard.png saved"
    except ImportError:
        shot = "no screenshot (Chromium/Playwright not prepared); open the URL manually"
    print(f"dashboard URL: {url}")
    print(f"datasource response: {count} matching row(s); saved in {out}; {shot}")
    return 0 if count else 1


def cmd_backup(a):
    dest = Path(a.dest).resolve()
    ws_state(dest)
    required = [dest / "client.json", dest / "runtime.env"]
    missing = [p.name for p in required if not p.is_file()]
    if missing:
        print("FAIL: required configuration missing, no backup created: " + ", ".join(missing)); return 1
    contents = {p.name: p.read_bytes() for p in required}  # read the selected files before creating anything
    d = dest / "saved" / f"{now('%Y%m%dT%H%M%SZ')}-{secrets.token_hex(3)}"
    d.mkdir(parents=True)
    for name, data in contents.items():
        (d / name).write_bytes(data)
    last = dest / "last-observation.json"
    if last.is_file():
        shutil.copy2(last, d / "last-observation.json")
    manifest = {"created": now(), "files": sorted(contents), "last_observation": "preserved" if last.is_file() else "absent",
                "validation_errors": validate(dest)}
    (d / "backup-manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(f"backup created {d} (last observation {manifest['last_observation']})")
    return 0


def cmd_apply(a):
    dest = Path(a.dest).resolve()
    st = ws_state(dest)
    errors = validate(dest)
    if errors:
        print("REJECTED before restart (the running process is unchanged):\n  " + "\n  ".join(errors)); return 1
    if sha_file(dest / "app-bin" / "Foundation.dll") != st["dll_sha256"]:
        print("FAIL: the compiled DLL changed; apply restarts the SAME compiled application only."); return 1
    stop_app(st)
    ok = start_app(dest, st)
    save_state(dest, st)
    env = read_env_file(dest / "runtime.env")["LAB_ENV"]
    client = (dest / "client.json").read_text(encoding="utf-8").strip()
    print(f"applied: same DLL sha256 {st['dll_sha256'][:16]}...; LAB_ENV={env}; served client.json {client}")
    print("Reload the page to read the served configuration." if ok else "FAIL: application did not restart; see app.log")
    return 0 if ok else 1


def cmd_stop(a):
    dest = Path(a.dest).resolve()
    st = ws_state(dest)
    stop_app(st)
    for name in st.get("containers", []):
        engine("rm", "--force", name)
    if st.get("network"):
        engine("network", "rm", st["network"])
    st["containers"] = []
    save_state(dest, st)
    print("stopped this workspace's application process and named containers; files and evidence are kept")
    return 0


def main():
    p = argparse.ArgumentParser(description="W1.10 helper")
    sub = p.add_subparsers(dest="cmd", required=True)
    sub.add_parser("prepare").add_argument("dest")
    sub.add_parser("fixtures")
    s = sub.add_parser("browser"); s.add_argument("dest"); s.add_argument("fixture", choices=sorted(FIXTURES))
    s.add_argument("--expect", required=True, choices=["received", "http-error", "unavailable"]); s.add_argument("--environment")
    for n in ("query", "grafana"):
        s = sub.add_parser(n); s.add_argument("dest"); s.add_argument("which")
    for n in ("backup", "apply", "stop"):
        sub.add_parser(n).add_argument("dest")
    a = p.parse_args()
    return {"prepare": cmd_prepare, "fixtures": cmd_fixtures, "browser": cmd_browser, "query": cmd_query, "grafana": cmd_grafana,
            "backup": cmd_backup, "apply": cmd_apply, "stop": cmd_stop}[a.cmd](a)


if __name__ == "__main__":
    sys.exit(main())

#!/usr/bin/env python3
"""Week 5 integrated-release runner (W5.06, W5.07, W5.10, P5).

    python3 "$W5_PACKAGE/run.py" test      --workspace DIR [--source SRC]
    python3 "$W5_PACKAGE/run.py" rehearse  --workspace DIR [--source SRC] --hint-mode success|validation|timeout
    python3 "$W5_PACKAGE/run.py" serve     --workspace DIR [--source SRC] --hint-mode MODE [--port 5055]
    python3 "$W5_PACKAGE/run.py" telemetry --workspace DIR [--source SRC] [--no-containers]

Every command copies SRC (default: the package's complete source) into DIR/build, builds it, creates the
SQLite database DIR/data/game.db, applies the existing migration EXPLICITLY (Api.dll --migrate), starts
the local hint server (simulated model; no live provider, no keys) and the API, and always stops the
processes it started (finally). test, rehearse and telemetry need a NEW workspace directory so earlier
evidence is never overwritten; serve may reuse its workspace so the retained database survives restarts.
"""
import argparse
import hashlib
import json
import os
import shutil
import subprocess
import sys
import time

sys.dont_write_bytecode = True  # keep the package folder free of __pycache__
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import w5lib as w  # noqa: E402

MODES = ("success", "validation", "timeout")


# --------------------------------------------------------------------------- stack lifecycle
class Stack:
    """Build, migrate and run hint server + API for one workspace."""

    def __init__(self, args, workspace, procs, port=None, extra_env=None):
        self.args, self.ws, self.procs = args, workspace, procs
        self.src = w.short_build_dir()  # build output is temporary; evidence stays in the workspace
        self.db = os.path.join(workspace, "data", "game.db")
        self.port = port or w.free_port()
        self.hint_port = w.free_port()
        self.base = f"http://127.0.0.1:{self.port}"
        self.extra_env = extra_env or {}
        self.api = None

    def prepare(self):
        source = os.path.abspath(self.args.source or w.SOURCE)
        if not os.path.isfile(os.path.join(source, "Academy.slnx")):
            w.fail(f"{source} is not a prepared Week 5 source copy (Academy.slnx missing).")
        w.say(f"source: {source}")
        w.copy_source(source, self.src)
        w.build(self.src, os.path.join(self.ws, "build.log"))
        os.makedirs(os.path.dirname(self.db), exist_ok=True)
        env = dict(os.environ, STORE="sqlite", GAME_DB=self.db)
        result = w.run(["dotnet", w.api_dll(self.src), "--migrate"], cwd=os.path.join(self.src, "Api"), env=env,
                       log=os.path.join(self.ws, "migrate.log"))
        w.say("migrate: " + " / ".join(result.stdout.strip().splitlines()))

    def start_hint(self):
        w.which_or_fail("node", "Install Node.js (course pin 22.23.2) to run the hint server.")
        env = dict(os.environ, HINT_PORT=str(self.hint_port), HINT_MODE=self.args.hint_mode)
        proc = self.procs.start("hint", ["node", os.path.join(self.src, "hint-server", "server.mjs")],
                                cwd=self.src, env=env, log_path=os.path.join(self.ws, "hint.log"))
        if not w.wait_ready(f"http://127.0.0.1:{self.hint_port}/healthz", 30, proc):
            w.fail(f"hint server did not start (see {self.ws}/hint.log)")
        w.say(f"hint server: simulated model mode '{self.args.hint_mode}' on port {self.hint_port}")

    def start_api(self):
        env = dict(os.environ, STORE="sqlite", GAME_DB=self.db, TRAINING_FAILURES="1",
                   HINT_URL=f"http://127.0.0.1:{self.hint_port}", LAB_ENV="local-rehearsal",
                   LAB_SESSION=os.path.basename(self.ws), **self.extra_env)
        self.api = self.procs.start("api", ["dotnet", w.api_dll(self.src), "--urls", self.base],
                                    cwd=os.path.join(self.src, "Api"), env=env,
                                    log_path=os.path.join(self.ws, "api.log"))
        if not w.wait_ready(self.base + "/health", 90, self.api):
            w.fail(f"API did not become ready (see {self.ws}/api.log)")
        w.say(f"api: {self.base} (database {self.db})")

    def restart_api(self):
        self.procs.stop("api")
        self.start_api()


# --------------------------------------------------------------------------- checks
def run_http_tests(stack):
    env = dict(os.environ, BASE_URL=stack.base, TRAINING_FAILURES="1")
    w.say("tests: dotnet Tests/bin/Release/net10.0/Tests.dll")
    result = subprocess.run(["dotnet", w.tests_dll(stack.src)], env=env, capture_output=True, text=True,
                            encoding="utf-8", errors="replace")
    with open(os.path.join(stack.ws, "tests.log"), "w", encoding="utf-8") as fh:
        fh.write(result.stdout + result.stderr + f"\nexit {result.returncode}\n")
    print(result.stdout.rstrip())
    if result.returncode != 0:
        lines = [l for l in (result.stderr or "").splitlines() if "Check failed" in l or "Exception" in l]
        print("\n".join(lines[:3]) or result.stderr[-1500:])
    w.say(f"tests exit {result.returncode}")
    return result.returncode


def hint_checks(stack):
    """Server-authoritative hint: forged client state ignored, permitted advice, no state change."""
    mode = stack.args.hint_mode
    status, _, created = w.http("POST", stack.base + "/api/sessions", {"boardId": "reference"})
    sid = created["sessionId"]
    status, _, east = w.http("POST", f"{stack.base}/api/sessions/{sid}/actions", {"type": "move", "direction": "east"})
    forged = {"state": {"position": {"x": 2, "y": 1}, "movesRemaining": 6, "score": 99, "collected": [], "status": "playing"}}
    status, _, hint = w.http("POST", f"{stack.base}/api/sessions/{sid}/hint", forged)
    _, _, after = w.http("GET", f"{stack.base}/api/sessions/{sid}")
    expected_source = "model" if mode == "success" else "fallback"
    checks = {
        "hint returns 200": status == 200,
        f"source is {expected_source} (mode {mode})": isinstance(hint, dict) and hint.get("source") == expected_source,
        "direction is permitted from stored (1,0): east (forged (2,1) would give north)":
            isinstance(hint, dict) and ((hint.get("hint") or {}).get("action") or {}).get("direction") == "east",
        "requestId present": isinstance(hint, dict) and bool(hint.get("requestId")),
        "W3.07 envelope: hint.action is a move, explanation 1-160 units":
            isinstance(hint, dict) and isinstance(hint.get("hint"), dict)
            and (hint["hint"].get("action") or {}).get("type") == "move"
            and 0 < len(hint["hint"].get("explanation") or "") <= 160,
        "hint did not change stored state (GET equals East envelope)": after == east,
    }
    for name, ok in checks.items():
        w.say(f"  {'ok  ' if ok else 'FAIL'} hint: {name}")
    return all(checks.values()), {"sessionId": sid, "hint": hint, "stateAfterHint": after.get("state") if isinstance(after, dict) else after}


def browser_checks(stack):
    """Optional Chromium check (Playwright). Skipped, and reported as skipped, when not installed."""
    browser_dir = os.path.join(w.PACKAGE, "browser")
    if shutil.which("node") is None or not os.path.isdir(os.path.join(browser_dir, "node_modules", "playwright")):
        w.say("  SKIP browser: Playwright is not installed (facilitator: npm ci && npx playwright install chromium "
              f"in {browser_dir}). HTTP checks above still ran.")
        return None
    result = subprocess.run(["node", os.path.join(browser_dir, "rehearse.mjs"), stack.base, stack.args.hint_mode],
                            capture_output=True, text=True, encoding="utf-8", errors="replace")
    with open(os.path.join(stack.ws, "browser.log"), "w", encoding="utf-8") as fh:
        fh.write(result.stdout + result.stderr)
    print(result.stdout.rstrip())
    return result.returncode == 0


# --------------------------------------------------------------------------- commands
def cmd_test(args):
    ws = w.new_workspace(args.workspace)
    with w.Processes() as procs:
        stack = Stack(args, ws, procs)
        stack.prepare()
        stack.start_hint()
        stack.start_api()
        code = run_http_tests(stack)
    w.say(f"{'PASS' if code == 0 else 'FAIL'} run.py test (workspace {ws})")
    return 0 if code == 0 else 1


def cmd_rehearse(args):
    ws = w.new_workspace(args.workspace)
    summary = {"workspace": ws, "hintMode": args.hint_mode, "liveModel": False}
    with w.Processes() as procs:
        stack = Stack(args, ws, procs)
        stack.prepare()
        stack.start_hint()
        stack.start_api()
        summary["httpTestsExit"] = run_http_tests(stack)
        summary["hintPassed"], summary["hintEvidence"] = hint_checks(stack)
        summary["browserPassed"] = browser_checks(stack)
        # Retained state: restart the API process on the same database and reload the hint session.
        sid = summary["hintEvidence"]["sessionId"]
        _, _, before = w.http("GET", f"{stack.base}/api/sessions/{sid}")
        stack.restart_api()
        _, _, reloaded = w.http("GET", f"{stack.base}/api/sessions/{sid}")
        summary["retainedAfterRestart"] = reloaded == before
        w.say(f"  {'ok  ' if summary['retainedAfterRestart'] else 'FAIL'} restart: GET {sid} equals the last confirmed state")
    w.write_json(os.path.join(ws, "rehearsal.json"), summary)
    passed = (summary["httpTestsExit"] == 0 and summary["hintPassed"] and summary["retainedAfterRestart"]
              and summary["browserPassed"] is not False)
    note = "" if summary["browserPassed"] is not None else " (browser checks SKIPPED)"
    w.say(f"{'PASS' if passed else 'FAIL'} rehearsal, hint mode {args.hint_mode}{note}; summary {ws}/rehearsal.json")
    return 0 if passed else 1


def cmd_serve(args):
    ws = os.path.abspath(args.workspace)
    os.makedirs(ws, exist_ok=True)
    retained = os.path.exists(os.path.join(ws, "data", "game.db"))
    with w.Processes() as procs:
        stack = Stack(args, ws, procs, port=args.port)
        stack.prepare()  # rebuilds the code; the database file in DIR/data is kept
        stack.start_hint()
        stack.start_api()
        w.say(f"{'Reusing retained' if retained else 'Created new'} database {stack.db}")
        w.say(f"Open {stack.base}/ in the browser (hint mode {args.hint_mode}; TRAINING_FAILURES=1).")
        if args.once:
            return 0
        w.wait_forever("Serving. Stop with Ctrl+C, then repeat the same command to reload a retained session.")
    return 0


def podman_ok():
    if shutil.which("podman") is None:
        return False
    return subprocess.run(["podman", "info"], capture_output=True).returncode == 0


def start_observability(ws, procs):
    """Loki + Grafana in one local pod (own containers only) or, failing that, the labelled local mock."""
    name = "academy-w5-tel-" + hashlib.sha1(ws.encode()).hexdigest()[:8]
    loki_port, grafana_port = w.free_port(), w.free_port()
    grafana_dir = os.path.join(w.PACKAGE, "grafana")
    cmds = [
        ["podman", "pod", "create", "--name", name, "-p", f"{loki_port}:3100", "-p", f"{grafana_port}:3000"],
        ["podman", "run", "-d", "--pod", name, "--name", name + "-loki", "docker.io/grafana/loki:3.5.5",
         "-config.file=/etc/loki/local-config.yaml"],
        ["podman", "run", "-d", "--pod", name, "--name", name + "-grafana",
         "-e", "GF_AUTH_ANONYMOUS_ENABLED=true", "-e", "GF_AUTH_ANONYMOUS_ORG_ROLE=Admin",
         "-e", "GF_AUTH_DISABLE_LOGIN_FORM=true",
         "-v", os.path.join(grafana_dir, "provisioning") + ":/etc/grafana/provisioning:ro",
         "-v", os.path.join(grafana_dir, "dashboards") + ":/var/lib/grafana/dashboards:ro",
         "docker.io/grafana/grafana:12.1.1"],
    ]
    for cmd in cmds:
        result = w.run(cmd, log=os.path.join(ws, "containers.log"), check=False)
        if result.returncode != 0:
            w.say(f"  containers: '{' '.join(cmd[:3])}' failed; see containers.log")
            subprocess.run(["podman", "pod", "rm", "-f", name], capture_output=True)
            return None
    loki = f"http://127.0.0.1:{loki_port}"
    grafana = f"http://127.0.0.1:{grafana_port}"
    if not (w.wait_ready(loki + "/ready", 120) and w.wait_ready(grafana + "/api/health", 120)):
        w.say("  containers: Loki/Grafana did not become ready; see containers.log")
        subprocess.run(["podman", "pod", "rm", "-f", name], capture_output=True)
        return None
    return {"pod": name, "loki": loki, "grafana": grafana}


def grafana_query(obs, request_id):
    body = {"queries": [{"refId": "A", "datasource": {"type": "loki", "uid": "academy-loki"},
                         "expr": f'{{job="academy-w5-actions"}} |= "{request_id}"', "queryType": "range",
                         "maxLines": 50}], "from": "now-15m", "to": "now"}
    status, _, result = w.http("POST", obs["grafana"] + "/api/ds/query", body)
    records = []

    def walk(node):
        if isinstance(node, str) and node.startswith("{"):
            try:
                value = json.loads(node)
                if isinstance(value, dict) and value.get("name") == "game.action":
                    records.append(value)
            except json.JSONDecodeError:
                pass
        elif isinstance(node, dict):
            for v in node.values():
                walk(v)
        elif isinstance(node, list):
            for v in node:
                walk(v)

    walk(result)
    return {"mode": "grafana-datasource", "status": status, "query": body, "records": records, "raw": result}


def cmd_telemetry(args):
    ws = w.new_workspace(args.workspace)
    spans = os.path.join(ws, "action-spans.jsonl")
    with w.Processes() as procs:
        obs = None if args.no_containers else (start_observability(ws, procs) if podman_ok() else None)
        if obs is None:
            w.say("  NOTE: Loki/Grafana unavailable: using the LOCAL MOCK query. This is NOT Grafana evidence.")
        try:
            collector_port = w.free_port()
            cmd = [sys.executable, os.path.join(w.PACKAGE, "collector", "collector.py"), "--port", str(collector_port),
                   "--out", spans] + (["--loki", obs["loki"]] if obs else [])
            proc = procs.start("collector", cmd, cwd=ws, env=dict(os.environ), log_path=os.path.join(ws, "collector.log"))
            if not w.wait_ready(f"http://127.0.0.1:{collector_port}/healthz", 20, proc):
                w.fail("collector bridge did not start")
            stack = Stack(args, ws, procs, port=args.port,
                          extra_env={"COLLECTOR_URL": f"http://127.0.0.1:{collector_port}/v1/action-spans"})
            stack.prepare()
            stack.start_hint()
            stack.start_api()

            # One accepted action and one injected after-write failure.
            _, _, created = w.http("POST", stack.base + "/api/sessions", {"boardId": "reference"})
            sid = created["sessionId"]
            status_ok, _, _ = w.http("POST", f"{stack.base}/api/sessions/{sid}/actions", {"type": "move", "direction": "east"})
            status_fail, _, failed = w.http("POST", f"{stack.base}/api/sessions/{sid}/actions",
                                            {"type": "move", "direction": "east"}, headers={"X-Training-Failure": "after-write"})
            request_id = failed.get("requestId") if isinstance(failed, dict) else None
            _, _, after = w.http("GET", f"{stack.base}/api/sessions/{sid}")
            w.say(f"accepted action: {status_ok}; injected failure: {status_fail} {failed.get('code') if isinstance(failed, dict) else failed}")
            w.say(f"requestId of the failed action: {request_id}")
            w.say(f"GET after failure: {json.dumps(after.get('state'))}")

            found, query = [], None
            for _ in range(30):  # Loki needs a moment to make pushed lines queryable
                if obs:
                    query = grafana_query(obs, request_id)
                else:
                    _, _, mock = w.http("GET", f"http://127.0.0.1:{collector_port}/mock/query?requestId={request_id}")
                    query = {"mode": "local-mock (NOT Grafana/Loki evidence)", "records": mock.get("records", [])}
                found = [r for r in query["records"] if r.get("requestId") == request_id]
                if found:
                    break
                time.sleep(1)
            query["requestId"] = request_id
            w.write_json(os.path.join(ws, "grafana-query.json"), query)
            record = found[0] if found else {}
            checks = {
                "record with this requestId reached the data source": bool(found),
                "status 500": record.get("status") == 500,
                "outcome rejected": record.get("outcome") == "rejected",
                "traceId present": bool(record.get("traceId")),
                "stored state unchanged (F02)": (after or {}).get("state", {}).get("position") == {"x": 1, "y": 0},
            }
            for name, ok in checks.items():
                w.say(f"  {'ok  ' if ok else 'FAIL'} {name}")
            passed = all(checks.values())
            w.say(f"evidence: {ws}/api.log, {spans}, {ws}/grafana-query.json ({query['mode']})")
            w.say(f"{'PASS' if passed else 'FAIL'} request-filtered data-source check")
            if obs:
                w.say(f"Grafana: {obs['grafana']}/d/academy-w5-hints?var-request_id={request_id}&from=now-15m&to=now")
                w.say("  (dashboard 'Hint request evidence'; type a Request ID in the textbox, last 15 minutes)")
            w.say(f"Browser: {stack.base}/ (start, East, tick Fail next save, East; correlate that request ID)")
            if not args.no_wait:
                w.wait_forever("Running. Record the view, then stop with Ctrl+C.")
            return 0 if passed else 1
        finally:
            if obs:
                subprocess.run(["podman", "pod", "rm", "-f", obs["pod"]], capture_output=True)
                w.say(f"removed own containers (pod {obs['pod']})")


def main():
    w.install_sigterm()
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("command", choices=["test", "rehearse", "serve", "telemetry"])
    parser.add_argument("--workspace", required=True)
    parser.add_argument("--source", help="prepared source copy (default: the package's complete source)")
    parser.add_argument("--hint-mode", default="success", choices=MODES)
    parser.add_argument("--port", type=int, help="API port (serve default 5055)")
    parser.add_argument("--no-containers", action="store_true", help="telemetry: skip Loki/Grafana (local mock)")
    parser.add_argument("--no-wait", action="store_true", help="telemetry: exit after the checks")
    parser.add_argument("--once", action="store_true", help="serve: exit once ready (used by facilitator checks)")
    args = parser.parse_args()
    if args.command == "serve" and args.port is None:
        args.port = 5055
    w.which_or_fail("dotnet", "Install the .NET SDK (course pin 10.0.401).")
    try:
        return {"test": cmd_test, "rehearse": cmd_rehearse, "serve": cmd_serve, "telemetry": cmd_telemetry}[args.command](args)
    except KeyboardInterrupt:
        return 130


if __name__ == "__main__":
    sys.exit(main())

"""W1.04 supplied adapter: run, inspect, probe and stop the supplied application container.

Run from this lab folder. Every engine command is printed before it runs, so you can reuse its syntax.

  python3 lab.py check-config [--config FILE]
  python3 lab.py run     [--config FILE] [--profile normal|changed] --name w104-NAME
  python3 lab.py inspect --name w104-NAME
  python3 lab.py probe   [--config FILE]
  python3 lab.py stop    --name w104-NAME
  python3 lab.py remove  --name w104-NAME
  python3 lab.py verify  [--config FILE] [--profile normal|changed]
  python3 lab.py prepare                     (facilitator: build the supplied image)

Environment: LAB_ENGINE=podman|docker (default docker), LAB_IMAGE (default localhost/academy-w104:10.0.12).
--config defaults to starter/mapping.json; --profile defaults to normal.
"""

import argparse
import json
import os
import secrets
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
ENGINE = os.environ.get("LAB_ENGINE", "docker")
IMAGE = os.environ.get("LAB_IMAGE", "localhost/academy-w104:10.0.12")
LABEL = "academy.module=w1-04"
FIXTURE = HERE / "fixtures" / "reference-board.json"


def run(args, check=False, show=True):
    if show:
        print("$ " + " ".join(args))
    try:
        r = subprocess.run(args, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    except FileNotFoundError:
        print(f"ENVIRONMENT BLOCKED: engine command '{args[0]}' not found. Set LAB_ENGINE or ask the facilitator.")
        raise SystemExit(4)
    out = r.stdout.decode("utf-8", "replace").rstrip()
    if show and out:
        print("  " + out.replace("\n", "\n  "))
    if check and r.returncode != 0:
        print(f"  exit {r.returncode}")
        raise SystemExit(4)
    return r.returncode, out


def load_mapping(path):
    p = (HERE / path) if not Path(path).is_absolute() else Path(path)
    try:
        data = json.loads(p.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        print(f"CONFIG ERROR in {path}: {exc}")
        raise SystemExit(2)
    for key in ("host_ip", "host_port", "container_port"):
        if key not in data:
            print(f"CONFIG ERROR: {path} has no '{key}'"); raise SystemExit(2)
    for key in ("host_port", "container_port"):
        if not isinstance(data[key], int) or not 1 <= data[key] <= 65535:
            print(f"CONFIG ERROR: {key} must be an unquoted number 1-65535 (got {data[key]!r})"); raise SystemExit(2)
    return data


def load_profile(name):
    p = HERE / "profiles" / f"{name}.json"
    if not p.is_file():
        print(f"CONFIG ERROR: unknown profile {name}"); raise SystemExit(2)
    return json.loads(p.read_text(encoding="utf-8")).get("env", {})


def own_name(name):
    if not name.startswith("w104-"):
        print("REFUSED: lab instance names must begin with w104-"); raise SystemExit(2)


def owned(name):
    code, out = run([ENGINE, "inspect", "--format", "{{index .Config.Labels \"academy.module\"}}", name], show=False)
    return code == 0 and out.strip() == "w1-04"


def run_args(mapping, profile, name):
    args = [ENGINE, "run", "--detach", "--name", name, "--label", LABEL,
            "--publish", f"{mapping['host_ip']}:{mapping['host_port']}:{mapping['container_port']}"]
    for key, value in load_profile(profile).items():
        args += ["--env", f"{key}={value}"]
    return args + [IMAGE]


def http_get(url, timeout=3):
    try:
        with urllib.request.urlopen(url, timeout=timeout) as r:
            return r.status, r.read(), dict(r.headers)
    except urllib.error.HTTPError as e:
        return e.code, e.read(), dict(e.headers)
    except (urllib.error.URLError, OSError) as e:
        return None, str(getattr(e, "reason", e)).encode(), {}


def probe(mapping, quiet=False):
    """Request the page and the reference board at the configured host endpoint; compare with the fixture."""
    base = f"http://{mapping['host_ip']}:{mapping['host_port']}"
    page_status, page, _ = http_get(base + "/")
    board_status, board, headers = http_get(base + "/api/boards/reference")
    page_ok = page_status == 200 and b"Treasure hunt board preview" in page
    board_ok = board_status == 200 and board == FIXTURE.read_bytes()
    if not quiet:
        print(f"GET {base}/  -> " + (f"HTTP {page_status}" if page_status else f"NO HTTP RESPONSE ({page.decode()})"))
        print(f"GET {base}/api/boards/reference -> " +
              (f"HTTP {board_status}" if board_status else f"NO HTTP RESPONSE ({board.decode()})"))
        if board_status:
            print(f"  X-Lab-Release: {headers.get('X-Lab-Release')}  X-Lab-Environment: {headers.get('X-Lab-Environment')}")
        print(("PASS" if page_ok and board_ok else "FAIL") +
              ": page and exact reference-board fixture" + ("" if board_ok or not board_status else " (body differs from fixture)"))
    return page_ok and board_ok


def cmd_check_config(a):
    mapping = load_mapping(a.config)
    print(f"config {a.config}: host {mapping['host_ip']}:{mapping['host_port']} -> container port {mapping['container_port']}")
    code, _ = run([ENGINE, "--version"])
    if code != 0:
        print("ENVIRONMENT BLOCKED: the engine is not available."); return 4
    code, _ = run([ENGINE, "image", "inspect", "--format", "{{.Id}}", IMAGE])
    if code != 0:
        print(f"ENVIRONMENT BLOCKED: image {IMAGE} is missing; ask the facilitator (python3 lab.py prepare)."); return 4
    print("PASS: configuration loads and the supplied image is available (reachability is not tested here)")
    return 0


def cmd_run(a):
    own_name(a.name)
    mapping = load_mapping(a.config)
    code, _ = run(run_args(mapping, a.profile, a.name))
    return 0 if code == 0 else 1


def cmd_inspect(a):
    own_name(a.name)
    run([ENGINE, "inspect", "--format",
         "image={{.ImageName}} image_id={{.Image}} running={{.State.Running}} status={{.State.Status}}", a.name])
    run([ENGINE, "top", a.name])
    run([ENGINE, "logs", a.name])
    run([ENGINE, "port", a.name])
    return 0


def cmd_probe(a):
    return 0 if probe(load_mapping(a.config)) else 1


def cmd_stop_remove(a, action):
    own_name(a.name)
    if not owned(a.name):
        print(f"REFUSED: {a.name} is not a W1.04 lab instance (label {LABEL} missing). Its owner must decide.")
        return 2
    code, _ = run([ENGINE, action, a.name])
    return 0 if code == 0 else 1


def cmd_verify(a):
    mapping = load_mapping(a.config)
    name = "w104-verify-" + secrets.token_hex(3)
    print(f"verify: temporary instance {name} using {a.config} and profile {a.profile}")
    code, _ = run(run_args(mapping, a.profile, name))
    ok = False
    try:
        if code == 0:
            deadline = time.time() + 20
            while time.time() < deadline and not ok:
                ok = probe(mapping, quiet=True)
                if not ok:
                    time.sleep(1)
            probe(mapping)
            run([ENGINE, "logs", name])
        else:
            print("FAIL: the engine could not create the instance (setup problem, not a reachability result)")
    finally:
        run([ENGINE, "rm", "--force", name])
    print("RESULT: " + ("PASS" if ok else "FAIL") + f" - required browser endpoint http://{mapping['host_ip']}:{mapping['host_port']}/")
    return 0 if ok else 1


def cmd_prepare(_a):
    code, _ = run([ENGINE, "build", "-t", IMAGE, "-f", str(HERE / "image" / "Containerfile"), str(HERE / "image")])
    return 0 if code == 0 else 1


def main():
    p = argparse.ArgumentParser(description="W1.04 supplied adapter")
    sub = p.add_subparsers(dest="cmd", required=True)
    for name in ("check-config", "probe", "verify", "run"):
        s = sub.add_parser(name)
        s.add_argument("--config", default="starter/mapping.json")
        if name in ("verify", "run"):
            s.add_argument("--profile", default="normal", choices=["normal", "changed"])
        if name == "run":
            s.add_argument("--name", required=True)
    for name in ("inspect", "stop", "remove"):
        sub.add_parser(name).add_argument("--name", required=True)
    sub.add_parser("prepare")
    a = p.parse_args()
    handlers = {"check-config": cmd_check_config, "run": cmd_run, "inspect": cmd_inspect, "probe": cmd_probe,
                "stop": lambda x: cmd_stop_remove(x, "stop"), "remove": lambda x: cmd_stop_remove(x, "rm"),
                "verify": cmd_verify, "prepare": cmd_prepare}
    return handlers[a.cmd](a)


if __name__ == "__main__":
    sys.exit(main())

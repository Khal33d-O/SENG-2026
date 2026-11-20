"""W1.07 supplied pipeline controller: commit -> build -> test -> scan -> local publish -> local deploy.

Run from the lab folder:
  python3 pipeline.py init --fixture demo|guided|starter|blocked --workspace work/NAME
  python3 pipeline.py run  --workspace work/NAME --out runs/NEW [--port 4317]
  python3 pipeline.py down --out runs/NAME

Stages (a stage runs only when every earlier stage passed; otherwise it is recorded as "skipped"):
  build    exports HEAD with git archive into OUT/snapshot and builds it (--pull=never), revision label = full commit
  test     runs the image and compares the served page with approval.json (release + SHA-256)
  scan     saves OUT/image.tar and scans THAT archive with Trivy: --severity CRITICAL --exit-code 7
  publish  copies the scanned archive to OUT/publication/ and writes receipt.json (local file handoff only)
  deploy   loads the published archive, starts it on 127.0.0.1:PORT and checks the HTTP page
Pipeline exit codes: 0 pass, 10 build failed, 20 test failed, 7 scan policy block, 11 scanner error,
30 publish failed, 40 deploy failed, 2 usage/preparation error.
Environment: LAB_ENGINE (default podman), W107_TRIVY (scanner executable), W107_TRIVY_CACHE (prepared DB cache).
No remote registry, CI account or BP service is contacted.
"""

import argparse
import datetime as dt
import hashlib
import json
import os
import secrets
import shutil
import socket
import subprocess
import sys
import tarfile
import time
import urllib.error
import urllib.request
from pathlib import Path

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
ENGINE = os.environ.get("LAB_ENGINE", "podman")
REPO = "localhost/academy-w107"
STAGES = ("build", "test", "scan", "publish", "deploy")
EXIT = {"build": 10, "test": 20, "publish": 30, "deploy": 40}


def now():
    return dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def sha256(path_or_bytes):
    h = hashlib.sha256()
    if isinstance(path_or_bytes, bytes):
        h.update(path_or_bytes)
    else:
        with open(path_or_bytes, "rb") as f:
            for chunk in iter(lambda: f.read(1 << 20), b""):
                h.update(chunk)
    return h.hexdigest()


def sh(args, log=None, cwd=None, env=None):
    """Run a command, print it, append command + output + exit to a log file."""
    print("$ " + " ".join(str(a) for a in args))
    try:
        r = subprocess.run([str(a) for a in args], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, cwd=cwd, env=env)
        code, out = r.returncode, r.stdout.decode("utf-8", "replace")
    except FileNotFoundError as exc:
        code, out = 127, f"command not found: {exc}"
    if log:
        with open(log, "a", encoding="utf-8") as f:
            f.write("$ " + " ".join(str(a) for a in args) + "\n" + out + f"\n[exit {code}]\n")
    return code, out


def git(ws, *args):
    env = dict(os.environ, GIT_CONFIG_NOSYSTEM="1", GIT_CONFIG_GLOBAL=os.devnull)
    r = subprocess.run(["git", "-C", str(ws), *args], stdout=subprocess.PIPE, stderr=subprocess.PIPE, env=env)
    if r.returncode != 0:
        raise SystemExit(f"git {' '.join(args)} failed: {r.stderr.decode().strip()}")
    return r.stdout


def free_port():
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def http_page(url, tries=30):
    for _ in range(tries):
        try:
            with urllib.request.urlopen(url, timeout=3) as r:
                return r.status, r.read()
        except urllib.error.HTTPError as e:
            return e.code, e.read()
        except (urllib.error.URLError, OSError):
            time.sleep(0.5)
    return None, b""


# ------------------------------------------------------------------ init
def cmd_init(a):
    ws = (HERE / a.workspace).resolve() if not Path(a.workspace).is_absolute() else Path(a.workspace)
    src = HERE / "fixtures" / a.fixture
    if ws.exists():
        print(f"REFUSED: {ws} already exists; choose another --workspace name (earlier work is kept)."); return 2
    committed, untracked = src / "committed", src / "untracked"
    shutil.copytree(committed, ws)
    git(ws, "init", "--quiet", "--initial-branch=main")
    for key, value in (("user.name", "W1.07 fixture"), ("user.email", "fixture@example.invalid"),
                       ("commit.gpgsign", "false"), ("core.autocrlf", "false")):
        git(ws, "config", "--local", key, value)
    git(ws, "add", ".")
    git(ws, "commit", "--quiet", "-m", f"Supplied {a.fixture} fixture")
    (ws / ".git" / "w107-fixture").write_text(a.fixture + "\n", encoding="utf-8")
    if untracked.is_dir():
        shutil.copytree(untracked, ws, dirs_exist_ok=True)
    print(f"initialised fixture '{a.fixture}' in {ws}")
    print("commit " + git(ws, "rev-parse", "HEAD").decode().strip())
    print(git(ws, "status", "--short").decode().rstrip() or "(working directory clean)")
    return 0


# ------------------------------------------------------------------ run
def cmd_run(a):
    ws = (HERE / a.workspace).resolve()
    out = (HERE / a.out).resolve()
    if out.exists():
        print(f"REFUSED: {out} already exists. Use a new --out directory so earlier evidence stays inspectable."); return 2
    fixture_file = ws / ".git" / "w107-fixture"
    if not fixture_file.is_file():
        print(f"REFUSED: {ws} is not a workspace created by pipeline.py init."); return 2
    fixture = fixture_file.read_text().strip()
    approval = json.loads((HERE / "approval.json").read_text(encoding="utf-8"))[fixture]
    out.mkdir(parents=True)
    commit = git(ws, "rev-parse", "HEAD").decode().strip()
    short = commit[:12]
    tag = f"{REPO}:{short}"
    rec = {"run": out.name, "started": now(), "workspace": str(ws), "fixture": fixture, "engine": ENGINE,
           "commit": commit, "tag": tag, "image_id": None,
           "committed_files": git(ws, "ls-tree", "-r", "--name-only", "HEAD").decode().split(),
           "working_status": git(ws, "status", "--short").decode().splitlines(),
           "approval": approval, "stages": {s: {"status": "skipped"} for s in STAGES}, "exit": None}
    exit_code = 0

    def save():
        (out / "run.json").write_text(json.dumps(rec, indent=2) + "\n", encoding="utf-8")

    def stage_fail(name, status, code, detail):
        nonlocal exit_code
        rec["stages"][name].update(status=status, detail=detail)
        exit_code = code
        print(f"STAGE {name}: {status.upper()} - {detail}")

    # build -----------------------------------------------------------------
    snap = out / "snapshot"
    snap.mkdir()
    archive = git(ws, "archive", "--format=tar", "HEAD")
    with tarfile.open(fileobj=__import__("io").BytesIO(archive)) as t:
        t.extractall(snap, filter="data")
    rec["input_hashes"] = {str(p.relative_to(snap)).replace("\\", "/"): sha256(p) for p in sorted(snap.rglob("*")) if p.is_file()}
    cmd = [ENGINE, "build", "--pull=never", "--label", f"org.opencontainers.image.revision={commit}",
           "-t", tag, "-f", snap / "Dockerfile", snap]
    rec["stages"]["build"] = {"status": "running", "command": " ".join(map(str, cmd)), "context": str(snap), "log": "build.log"}
    code, log = sh(cmd, out / "build.log")
    if code != 0:
        stage_fail("build", "failed", EXIT["build"], f"build command exited {code}; see build.log")
    else:
        _, iid = sh([ENGINE, "image", "inspect", "--format", "{{.Id}}", tag])
        _, label = sh([ENGINE, "image", "inspect", "--format", '{{index .Labels "org.opencontainers.image.revision"}}', tag])
        rec["image_id"] = iid.strip()
        if label.strip() != commit:
            stage_fail("build", "failed", EXIT["build"], "revision label does not match the selected commit")
        else:
            rec["stages"]["build"]["status"] = "passed"
            print(f"STAGE build: PASSED image {rec['image_id']} tag {tag}")

    # test ------------------------------------------------------------------
    if exit_code == 0:
        name, port = f"w107-test-{secrets.token_hex(3)}", free_port()
        rec["stages"]["test"] = {"status": "running", "log": "test.log"}
        code, _ = sh([ENGINE, "run", "--detach", "--name", name, "-p", f"127.0.0.1:{port}:80", rec["image_id"]], out / "test.log")
        status, body = http_page(f"http://127.0.0.1:{port}/") if code == 0 else (None, b"")
        sh([ENGINE, "rm", "--force", name], out / "test.log")
        (out / "observed-page.html").write_bytes(body)
        rec["stages"]["test"].update(observed_status=status, observed_sha256=sha256(body), expected_sha256=approval["page_sha256"])
        if status == 200 and sha256(body) == approval["page_sha256"]:
            rec["stages"]["test"]["status"] = "passed"
            print(f"STAGE test: PASSED page matches approved release '{approval['release']}'")
        else:
            stage_fail("test", "failed", EXIT["test"], f"served page (HTTP {status}) does not match approved release "
                       f"'{approval['release']}'; see observed-page.html")

    # scan ------------------------------------------------------------------
    if exit_code == 0:
        tar = out / "image.tar"
        sh([ENGINE, "save", "--format", "docker-archive", "-o", tar, tag] if ENGINE == "podman" else [ENGINE, "save", "-o", tar, tag],
           out / "scan.log")
        rec["stages"]["scan"] = {"status": "running", "archive": "image.tar", "archive_sha256": sha256(tar), "log": "scan.log"}
        trivy, cache = os.environ.get("W107_TRIVY"), os.environ.get("W107_TRIVY_CACHE")
        meta = Path(cache or "") / "db" / "metadata.json"
        if not trivy or not Path(trivy).is_file() or not cache or not meta.is_file():
            stage_fail("scan", "error", 11, "scanner preparation missing (W107_TRIVY / W107_TRIVY_CACHE); no policy decision exists")
        else:
            rec["stages"]["scan"]["database"] = json.loads(meta.read_text(encoding="utf-8"))
            cmd = [trivy, "image", "--input", tar, "--severity", "CRITICAL", "--exit-code", "7", "--format", "json",
                   "--output", out / "scan-report.json", "--cache-dir", cache, "--cache-backend", "memory",
                   "--skip-db-update", "--offline-scan", "--scanners", "vuln", "--timeout", "15m", "--quiet"]
            rec["stages"]["scan"]["command"] = " ".join(map(str, cmd))
            code, _ = sh(cmd, out / "scan.log")
            rec["stages"]["scan"]["scanner_exit"] = code
            report = json.loads((out / "scan-report.json").read_text(encoding="utf-8")) if (out / "scan-report.json").is_file() else {}
            critical = sum(1 for r in report.get("Results", []) for v in (r.get("Vulnerabilities") or [])
                           if v.get("Severity") == "CRITICAL")
            scanned_id = report.get("Metadata", {}).get("ImageID", "")
            rec["stages"]["scan"].update(critical_findings=critical, scanned_image_id=scanned_id)
            if code not in (0, 7) or not report:
                stage_fail("scan", "error", 11, f"scanner did not complete (exit {code}); see scan.log")
            elif scanned_id.replace("sha256:", "") != rec["image_id"].replace("sha256:", ""):
                stage_fail("scan", "error", 11, f"scanned image identity {scanned_id} differs from built image")
            elif code == 7:
                stage_fail("scan", "blocked", 7, f"{critical} CRITICAL finding(s): policy blocks publication and deployment")
            else:
                rec["stages"]["scan"]["status"] = "passed"
                print("STAGE scan: PASSED no CRITICAL findings under the recorded database")

    # publish ---------------------------------------------------------------
    if exit_code == 0:
        pub = out / "publication"
        pub.mkdir()
        shutil.copy2(out / "image.tar", pub / "image.tar")
        receipt = {"commit": commit, "tag": tag, "image_id": rec["image_id"], "archive": "publication/image.tar",
                   "archive_sha256": sha256(pub / "image.tar"), "scanned_archive_sha256": rec["stages"]["scan"]["archive_sha256"],
                   "published": now(), "destination": "local directory only (no registry)"}
        (pub / "receipt.json").write_text(json.dumps(receipt, indent=2) + "\n", encoding="utf-8")
        rec["stages"]["publish"] = {"status": "running", "receipt": "publication/receipt.json"}
        if receipt["archive_sha256"] != receipt["scanned_archive_sha256"]:
            stage_fail("publish", "failed", EXIT["publish"], "published archive hash differs from the scanned archive")
        else:
            rec["stages"]["publish"]["status"] = "passed"
            print(f"STAGE publish: PASSED {pub / 'image.tar'} sha256 {receipt['archive_sha256']}")

    # deploy ----------------------------------------------------------------
    if exit_code == 0:
        name = f"w107-{out.name}"[:60]
        rec["stages"]["deploy"] = {"status": "running", "container": name, "port": a.port, "log": "deploy.log"}
        sh([ENGINE, "load", "-i", out / "publication" / "image.tar"], out / "deploy.log")
        code, _ = sh([ENGINE, "run", "--detach", "--name", name, "--label", "academy.module=w1-07",
                      "-p", f"127.0.0.1:{a.port}:80", rec["image_id"]], out / "deploy.log")
        _, deployed = sh([ENGINE, "inspect", "--format", "{{.Image}}", name])
        status, body = http_page(f"http://127.0.0.1:{a.port}/") if code == 0 else (None, b"")
        rec["stages"]["deploy"].update(deployed_image_id=deployed.strip(), observed_status=status, url=f"http://127.0.0.1:{a.port}/")
        if code == 0 and status == 200 and sha256(body) == approval["page_sha256"] and deployed.strip() == rec["image_id"]:
            rec["stages"]["deploy"]["status"] = "passed"
            print(f"STAGE deploy: PASSED open http://127.0.0.1:{a.port}/ (stop later with: python3 pipeline.py down --out {a.out})")
        else:
            stage_fail("deploy", "failed", EXIT["deploy"], f"local deployment check failed (run exit {code}, HTTP {status}); port in use?")

    rec["exit"] = exit_code
    rec["finished"] = now()
    save()
    print("\nSTAGES: " + "  ".join(f"{s}={rec['stages'][s]['status']}" for s in STAGES))
    print(f"commit {commit}\nimage  {rec['image_id']}\nrecord {out / 'run.json'}")
    print("PIPELINE " + ("PASSED" if exit_code == 0 else f"STOPPED (exit {exit_code})"))
    return exit_code


def cmd_down(a):
    out = (HERE / a.out).resolve()
    rec = json.loads((out / "run.json").read_text(encoding="utf-8"))
    name = rec["stages"]["deploy"].get("container")
    if not name:
        print("This run created no deployment container; nothing to stop. Evidence is kept."); return 0
    sh([ENGINE, "rm", "--force", name])
    print("stopped and removed only " + name + "; source, scan reports and receipts are kept")
    return 0


def main():
    p = argparse.ArgumentParser(description="W1.07 local pipeline")
    sub = p.add_subparsers(dest="cmd", required=True)
    s = sub.add_parser("init"); s.add_argument("--fixture", required=True, choices=["demo", "guided", "starter", "blocked"])
    s.add_argument("--workspace", required=True)
    s = sub.add_parser("run"); s.add_argument("--workspace", required=True); s.add_argument("--out", required=True)
    s.add_argument("--port", type=int, default=4317)
    s = sub.add_parser("down"); s.add_argument("--out", required=True)
    a = p.parse_args()
    return {"init": cmd_init, "run": cmd_run, "down": cmd_down}[a.cmd](a)


if __name__ == "__main__":
    sys.exit(main())

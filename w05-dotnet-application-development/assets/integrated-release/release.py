#!/usr/bin/env python3
"""Week 5 classroom GitOps adapter (W5.08, W5.09, P5).

    python3 "$W5_PACKAGE/release.py" init     --workspace W
    python3 "$W5_PACKAGE/release.py" pipeline --workspace W
    python3 "$W5_PACKAGE/release.py" select   --workspace W --image IMAGE
    python3 "$W5_PACKAGE/release.py" sync     --workspace W
    python3 "$W5_PACKAGE/release.py" check    --workspace W
    python3 "$W5_PACKAGE/release.py" stop     --workspace W      (local runtime only; storage is kept)

init      W/source (Git: the complete integrated source) and W/configuration (Git: deployment YAML).
pipeline  rejects an uncommitted source tree, runs the HTTP tests (run.py test) and dotnet publish, then
          builds a unique image tag containing the commit, with the OCI revision label. Success writes
          W/pipeline-<commit>/result.json (sourceCommit, image, imageId). A failure is retained as
          W/pipeline-<commit>-failed-N and no success record is created. A passing commit is reused.
select    writes a PASSING image from this workspace into W/configuration and commits that change.
          The schema, migration init step and retained volume are never changed.
sync      transports the configuration revision and reconciles it, then runs `check`.
          Classroom mode (facilitator-supplied, pending): W5_GITOPS_REMOTE, W5_ARGOCD_APP, W5_SERVICE_URL.
          Otherwise LOCAL RECONCILE (clearly labelled, not Argo): a local Podman pod (or, without
          Podman, local processes) runs the selected image with the retained data volume (Recreate).
check     compares the previously retained session first, then creates a session, sends East
          (x=1, five moves, GET agrees) and requests a hint (legal simulated fallback, no state change).

Image kinds: "podman" when a Podman engine answers, otherwise "local-archive" (a tar of the publish
output identified by its sha256; labelled, never presented as a container image).
"""
import argparse
import datetime
import glob
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tarfile
import tempfile
import time

sys.dont_write_bytecode = True  # keep the package folder free of __pycache__
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import w5lib as w  # noqa: E402

GITOPS = os.path.join(w.PACKAGE, "gitops")
DEPLOYMENT = os.path.join("apps", "academy-w5", "deployment.yaml")
HINT_IMAGE = "localhost/academy-w5-hint:known-good"


# --------------------------------------------------------------------------- helpers
def now():
    return datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds")


def git(repo, *args, check=True):
    result = subprocess.run(["git", "-C", repo, *args], capture_output=True, text=True, encoding="utf-8")
    if check and result.returncode != 0:
        w.fail(f"git {' '.join(args)} failed: {result.stderr.strip()}")
    return result.stdout.strip()


def ensure_identity(repo):
    """Commits need an author. Use the learner's own Git identity, or a synthetic local one."""
    if not git(repo, "config", "user.email", check=False):
        git(repo, "config", "user.name", "academy-learner")
        git(repo, "config", "user.email", "learner@academy.invalid")


def podman_ok():
    if os.environ.get("W5_IMAGE_MODE") == "local-archive" or shutil.which("podman") is None:
        return False
    return subprocess.run(["podman", "info"], capture_output=True).returncode == 0


def state_path(ws):
    return os.path.join(ws, "release-state.json")


def load_state(ws):
    if not os.path.isfile(state_path(ws)):
        w.fail(f"{ws} is not a release workspace: run release.py init --workspace {ws} first.")
    return w.read_json(state_path(ws))


def save_state(ws, state):
    w.write_json(state_path(ws), state)


def next_index(folder, prefix):
    os.makedirs(folder, exist_ok=True)
    return len(glob.glob(os.path.join(folder, prefix + "-*.json"))) + 1


def release_label(source):
    with open(os.path.join(source, "Api", "Program.cs"), encoding="utf-8") as fh:
        m = re.search(r'const string Release = "([^"]+)";', fh.read())
    return m.group(1) if m else "unknown"


def passing_results(ws):
    for path in sorted(glob.glob(os.path.join(ws, "pipeline-*", "result.json"))):
        if "-failed-" in path:
            continue
        result = w.read_json(path)
        if result.get("passed"):
            yield path, result


# --------------------------------------------------------------------------- init
def cmd_init(args):
    ws = w.new_workspace(args.workspace)
    w.which_or_fail("git", "Install Git.")
    source, config = os.path.join(ws, "source"), os.path.join(ws, "configuration")
    w.copy_source(w.SOURCE, source)
    shutil.copytree(GITOPS, config)
    for repo, message in ((source, "Known-good integrated checkpoint"), (config, "Initial configuration (no image selected)")):
        git(repo, "init", "-q", "-b", "main")
        ensure_identity(repo)
        git(repo, "add", "-A")
        git(repo, "commit", "-q", "-m", message)
    save_state(ws, {"created": now(), "imageMode": "podman" if podman_ok() else "local-archive",
                    "localPort": w.free_port(), "name": "academy-w5-rel-" + hashlib.sha1(ws.encode()).hexdigest()[:8]})
    w.say(f"source:        {source} (commit {git(source, 'rev-parse', 'HEAD')})")
    w.say(f"configuration: {config} (commit {git(config, 'rev-parse', 'HEAD')})")
    w.say(f"image kind:    {load_state(ws)['imageMode']}")
    return 0


# --------------------------------------------------------------------------- pipeline
def cmd_pipeline(args):
    ws = os.path.abspath(args.workspace)
    state = load_state(ws)
    source = os.path.join(ws, "source")
    if git(source, "status", "--porcelain"):
        w.say(git(source, "status", "--short"))
        w.fail("source has uncommitted changes. Review and commit them first; the pipeline builds commits only.")
    commit = git(source, "rev-parse", "HEAD")
    final = os.path.join(ws, f"pipeline-{commit}")
    if os.path.isfile(os.path.join(final, "result.json")):
        result = w.read_json(os.path.join(final, "result.json"))
        w.say(f"Reusing the passing pipeline for {commit}: image {result['image']}")
        w.say(f"result: {os.path.join(final, 'result.json')}")
        return 0
    attempt = os.path.join(ws, f"p-{commit[:12]}.partial")  # short path: Windows MAX_PATH
    shutil.rmtree(attempt, ignore_errors=True)
    os.makedirs(attempt)
    record = {"passed": False, "sourceCommit": commit, "releaseLabel": release_label(source), "started": now()}

    def failed(stage, detail):
        n = len(glob.glob(final + "-failed-*")) + 1
        record.update(stage=stage, detail=detail, finished=now())
        w.write_json(os.path.join(attempt, "result.json"), record)
        os.replace(attempt, f"{final}-failed-{n}")
        w.say(f"FAIL pipeline at stage '{stage}': {detail}")
        w.say(f"failed evidence retained: {final}-failed-{n} (no success record was created)")
        return 1

    # Stage 1: HTTP tests against a fresh database (actual responses plus retained state).
    tests_ws = os.path.join(attempt, "t")
    w.say(f"stage tests: run.py test --source {source}")
    code = subprocess.run([sys.executable, os.path.join(w.PACKAGE, "run.py"), "test", "--source", source,
                           "--workspace", tests_ws]).returncode
    record["httpTests"] = {"exit": code, "workspace": "t/ (inside this pipeline record folder)"}
    if code != 0:
        return failed("http-tests", f"run.py test exited {code} (see {tests_ws}/tests.log)")

    # Stage 2: publish the runnable assembly (from a clean copy of the committed tree).
    context = os.path.join(os.path.dirname(w.short_build_dir()), "context")  # short temporary build context
    publish = os.path.join(context, "publish")
    os.makedirs(context, exist_ok=True)
    w.say("stage publish: dotnet publish Api/Api.csproj -c Release")
    build = w.copy_source(source, w.short_build_dir())
    result = w.run(["dotnet", "publish", os.path.join(build, "Api", "Api.csproj"), "-c", "Release",
                    "-o", publish], log=os.path.join(attempt, "publish.log"), check=False)
    if result.returncode != 0:
        return failed("publish", "dotnet publish failed (see publish.log)")

    # Stage 3: package with a unique tag containing the commit, plus the OCI revision label.
    tag = f"{record['releaseLabel']}-{commit[:12]}"
    shutil.copy(os.path.join(source, "Containerfile"), os.path.join(context, "Containerfile"))
    if state["imageMode"] == "podman":
        image = f"localhost/academy-w5-api:{tag}"
        w.say(f"stage image: podman build -t {image}")
        result = w.run(["podman", "build", "-t", image, "--label", f"org.opencontainers.image.revision={commit}",
                        "-f", os.path.join(context, "Containerfile"), context],
                       log=os.path.join(attempt, "image.log"), check=False)
        if result.returncode != 0:
            return failed("image", "podman build failed (see image.log)")
        image_id = w.run(["podman", "image", "inspect", image, "--format", "{{.Id}}"]).stdout.strip()
        revision = w.run(["podman", "image", "inspect", image, "--format",
                          '{{index .Labels "org.opencontainers.image.revision"}}']).stdout.strip()
        if revision != commit:
            return failed("image", f"OCI revision label {revision} does not match {commit}")
    else:
        image = f"local-archive/academy-w5-api:{tag}"
        archive = os.path.join(attempt, "image.tar.gz")
        w.say(f"stage image: LOCAL ARCHIVE {image} (no container engine available)")
        with tarfile.open(archive, "w:gz") as tar:
            tar.add(publish, arcname="publish")
        with open(archive, "rb") as fh:
            image_id = "sha256:" + hashlib.sha256(fh.read()).hexdigest()
        record["archive"] = os.path.join(final, "image.tar.gz")

    record.update(passed=True, image=image, imageId=image_id, imageKind=state["imageMode"], finished=now())
    w.write_json(os.path.join(attempt, "result.json"), record)
    os.replace(attempt, final)
    w.say(f"PASS pipeline for source commit {commit}")
    w.say(f"image:   {image}")
    w.say(f"imageId: {image_id}")
    w.say(f"result:  {os.path.join(final, 'result.json')}")
    return 0


# --------------------------------------------------------------------------- select
def cmd_select(args):
    ws = os.path.abspath(args.workspace)
    load_state(ws)
    if not args.image:
        w.fail("select needs --image (copy the exact image value from a passing result.json)")
    matches = [r for _, r in passing_results(ws) if r["image"] == args.image]
    if not matches:
        known = [r["image"] for _, r in passing_results(ws)]
        w.fail(f"'{args.image}' has no passing pipeline result in this workspace. Passing images: {known or 'none'}")
    config = os.path.join(ws, "configuration")
    path = os.path.join(config, DEPLOYMENT)
    with open(path, encoding="utf-8") as fh:
        text = fh.read()
    text = re.sub(r"(image: )\S+(\s+# selected-app-image)", lambda m: m.group(1) + args.image + m.group(2), text)
    # The migration init image is pinned once, at the first selection (the known-good release).
    text = re.sub(r"(image: )\S*:unselected(\s+# known-good-migration-image)",
                  lambda m: m.group(1) + args.image + m.group(2), text)
    with open(path, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(text)
    ensure_identity(config)
    git(config, "add", DEPLOYMENT.replace(os.sep, "/"))
    git(config, "commit", "-q", "--allow-empty", "-m", f"Select {args.image}")
    revision = git(config, "rev-parse", "HEAD")
    w.say(f"configuration commit {revision} selects {args.image} (source commit {matches[0]['sourceCommit']})")
    w.say("Selection alone does not deploy it: run release.py sync.")
    return 0


# --------------------------------------------------------------------------- runtime (local reconcile)
def desired(config):
    with open(os.path.join(config, DEPLOYMENT), encoding="utf-8") as fh:
        text = fh.read()
    app = re.search(r"image: (\S+)\s+# selected-app-image", text).group(1)
    migrate = re.search(r"image: (\S+)\s+# known-good-migration-image", text).group(1)
    hint_mode = re.search(r"HINT_MODE, value: (\w+)", text).group(1)
    lab_env = re.search(r"LAB_ENV, value: ([\w-]+)", text).group(1)
    return {"app": app, "migrate": migrate, "hintMode": hint_mode, "labEnv": lab_env}


def result_for(ws, image):
    for _, r in passing_results(ws):
        if r["image"] == image:
            return r
    return None


def stop_local(ws, state):
    if state["imageMode"] == "podman":
        subprocess.run(["podman", "pod", "rm", "-f", state["name"]], capture_output=True)
    pids = os.path.join(ws, "runtime", "pids.json")
    if os.path.isfile(pids):
        for pid in w.read_json(pids).values():
            if w.IS_WINDOWS:
                subprocess.run(["taskkill", "/PID", str(pid), "/T", "/F"], capture_output=True)
            else:
                try:
                    os.kill(pid, 15)
                except OSError:
                    pass
        os.remove(pids)


def reconcile_podman(ws, state, want):
    name, port = state["name"], state["localPort"]
    volume = name + "-data"  # retained: never removed by this adapter
    log = os.path.join(ws, "runtime", "containers.log")
    if subprocess.run(["podman", "image", "exists", HINT_IMAGE]).returncode != 0:
        w.run(["podman", "build", "-t", HINT_IMAGE, os.path.join(ws, "source", "hint-server")], log=log)
    w.run(["podman", "pod", "create", "--name", name, "-p", f"{port}:8080"], log=log)
    w.say(f"init container: {want['migrate']} --migrate (volume {volume})")
    w.say("  " + w.run(["podman", "run", "--rm", "--pod", name, "-v", f"{volume}:/data", want["migrate"], "--migrate"],
                       log=log).stdout.strip().replace("\n", " / "))
    w.run(["podman", "run", "-d", "--pod", name, "--name", name + "-hint", "-e", f"HINT_MODE={want['hintMode']}",
           "-e", "HINT_PORT=5056", HINT_IMAGE], log=log)
    w.run(["podman", "run", "-d", "--pod", name, "--name", name + "-api", "-v", f"{volume}:/data",
           "-e", "HINT_URL=http://127.0.0.1:5056", "-e", f"LAB_ENV={want['labEnv']}", want["app"]], log=log)
    runtime_id = w.run(["podman", "inspect", name + "-api", "--format", "{{.Image}}"]).stdout.strip()
    return f"http://127.0.0.1:{port}", runtime_id, f"podman volume {volume}"


def extract(archive, dest):
    with tarfile.open(archive) as tar:
        try:
            tar.extractall(dest, filter="data")  # safe extraction (Python 3.12+ and patched 3.8+)
        except TypeError:
            tar.extractall(dest)


def reconcile_archive(ws, state, want):
    result = result_for(ws, want["app"])
    runtime = os.path.join(ws, "runtime")
    # Extracted archives live in a short temporary path (Windows MAX_PATH); logs stay in the workspace.
    unpack = os.path.join(tempfile.gettempdir(), state["name"])
    app_dir = os.path.join(unpack, "app-" + result["imageId"].split(":")[1][:12])
    if not os.path.isdir(app_dir):
        extract(result["archive"], app_dir)
    data = os.path.join(ws, "retained-data")
    os.makedirs(data, exist_ok=True)
    env = dict(os.environ, STORE="sqlite", GAME_DB=os.path.join(data, "game.db"))
    migrate_dir = os.path.join(unpack, "app-" + result_for(ws, want["migrate"])["imageId"].split(":")[1][:12])
    if not os.path.isdir(migrate_dir):
        extract(result_for(ws, want["migrate"])["archive"], migrate_dir)
    w.say("init step: " + w.run(["dotnet", os.path.join(migrate_dir, "publish", "Api.dll"), "--migrate"],
                                cwd=os.path.join(migrate_dir, "publish"), env=env).stdout.strip().replace("\n", " / "))
    port, hint_port = state["localPort"], w.free_port()
    flags = (subprocess.DETACHED_PROCESS | subprocess.CREATE_NEW_PROCESS_GROUP) if w.IS_WINDOWS else 0
    pids = {}
    hint_env = dict(os.environ, HINT_MODE=want["hintMode"], HINT_PORT=str(hint_port))
    with open(os.path.join(runtime, "hint.log"), "a") as log:
        pids["hint"] = subprocess.Popen(["node", os.path.join(ws, "source", "hint-server", "server.mjs")], env=hint_env,
                                        stdout=log, stderr=subprocess.STDOUT, creationflags=flags,
                                        start_new_session=not w.IS_WINDOWS).pid
    api_env = dict(env, HINT_URL=f"http://127.0.0.1:{hint_port}", LAB_ENV=want["labEnv"])
    with open(os.path.join(runtime, "api.log"), "a") as log:
        pids["api"] = subprocess.Popen(["dotnet", "Api.dll", "--urls", f"http://127.0.0.1:{port}"],
                                       cwd=os.path.join(app_dir, "publish"), env=api_env, stdout=log,
                                       stderr=subprocess.STDOUT, creationflags=flags,
                                       start_new_session=not w.IS_WINDOWS).pid
    w.write_json(os.path.join(runtime, "pids.json"), pids)
    return f"http://127.0.0.1:{port}", result["imageId"], data


def sync_classroom(ws, config, revision):
    """Facilitator-supplied classroom path (pending): push to the prepared Git daemon, ask Argo to sync."""
    remote, app = os.environ["W5_GITOPS_REMOTE"], os.environ.get("W5_ARGOCD_APP", "academy-w5")
    git(config, "push", "--force", remote, "HEAD:refs/heads/main")
    patch = json.dumps({"operation": {"initiatedBy": {"username": "release.py"}, "sync": {"revision": revision}}})
    w.run(["kubectl", "-n", "argocd", "patch", "application", app, "--type", "merge", "-p", patch])
    status = {}
    for _ in range(60):
        out = w.run(["kubectl", "-n", "argocd", "get", "application", app, "-o", "json"]).stdout
        status = json.loads(out).get("status", {})
        if (status.get("sync", {}).get("revision") == revision and status.get("sync", {}).get("status") == "Synced"
                and status.get("health", {}).get("status") == "Healthy"):
            break
        time.sleep(5)
    image_id = w.run(["kubectl", "-n", "academy-w5", "get", "pods", "-l", "app=academy-w5-api", "-o",
                      'jsonpath={..containerStatuses[?(@.name=="api")].imageID}'], check=False).stdout.strip()
    return os.environ.get("W5_SERVICE_URL", ""), image_id, {"sync": status.get("sync"), "health": status.get("health")}


def cmd_sync(args):
    ws = os.path.abspath(args.workspace)
    state = load_state(ws)
    config = os.path.join(ws, "configuration")
    revision = git(config, "rev-parse", "HEAD")
    want = desired(config)
    if want["app"].endswith(":unselected"):
        w.fail("no image selected yet: run release.py select --image <image from a passing result.json>")
    record = {"time": now(), "configurationRevision": revision, "selectedImage": want["app"],
              "migrationImage": want["migrate"], "pipelineImageId": (result_for(ws, want["app"]) or {}).get("imageId")}
    if os.environ.get("W5_GITOPS_REMOTE"):
        record["mode"] = "classroom Argo CD (facilitator-supplied)"
        base, runtime_id, record["argo"] = sync_classroom(ws, config, revision)
        record["storage"] = "hostPath /var/lib/academy-w5/data (retained)"
    else:
        record["mode"] = "LOCAL RECONCILE (not Argo CD): Recreate on this machine"
        os.makedirs(os.path.join(ws, "runtime"), exist_ok=True)
        stop_local(ws, state)  # Recreate: the old release stops before the new one starts; storage is kept
        if state["imageMode"] == "podman":
            base, runtime_id, record["storage"] = reconcile_podman(ws, state, want)
        else:
            base, runtime_id, record["storage"] = reconcile_archive(ws, state, want)
    record["serviceUrl"], record["runtimeImageId"] = base, runtime_id
    record["ready"] = bool(base) and w.wait_ready(base + "/health", 120)
    if record["ready"]:
        _, headers, _ = w.http("GET", base + "/health")
        record["healthRelease"] = headers.get("X-Lab-Release")
    index = next_index(os.path.join(ws, "deployments"), "deployment")
    path = os.path.join(ws, "deployments", f"deployment-{index:03d}.json")
    w.write_json(path, record)
    w.say(f"{record['mode']}")
    w.say(f"configuration revision {revision}; image {want['app']}")
    w.say(f"runtime image ID {runtime_id}; ready {record['ready']}; health release {record.get('healthRelease')}")
    w.say(f"deployment record: {path}")
    if not record["ready"]:
        w.say("FAIL not ready: retain these conditions, reselect the known-good image and sync again. "
              "Do not delete storage.")
        return 1
    return run_check(ws, base)


# --------------------------------------------------------------------------- check
def run_check(ws, base):
    checks, evidence = {}, {"serviceUrl": base, "time": now()}
    retained_path = os.path.join(ws, "retained-session.json")
    _, headers, _ = w.http("GET", base + "/health")
    evidence["healthRelease"] = headers.get("X-Lab-Release")
    if os.path.isfile(retained_path):
        retained = w.read_json(retained_path)
        status, _, current = w.http("GET", f"{base}/api/sessions/{retained['sessionId']}")
        checks[f"prior session {retained['sessionId']} equals the retained envelope"] = status == 200 and current == retained
        evidence["priorSession"] = {"status": status, "body": current}
    status, _, created = w.http("POST", base + "/api/sessions", {"boardId": "reference"})
    checks["create 201"] = status == 201
    sid = created["sessionId"] if isinstance(created, dict) else None
    status, _, east = w.http("POST", f"{base}/api/sessions/{sid}/actions", {"type": "move", "direction": "east"})
    st = (east or {}).get("state", {}) if isinstance(east, dict) else {}
    checks["East 200, x=1, five moves"] = status == 200 and st.get("position", {}).get("x") == 1 and st.get("movesRemaining") == 5
    _, _, got = w.http("GET", f"{base}/api/sessions/{sid}")
    checks["GET agrees with East"] = got == east
    status, _, hint = w.http("POST", f"{base}/api/sessions/{sid}/hint", {})
    direction = (((hint or {}).get("hint") or {}).get("action") or {}).get("direction") if isinstance(hint, dict) else None
    checks[f"hint 200, legal direction ({direction}, source {(hint or {}).get('source') if isinstance(hint, dict) else None})"] = \
        status == 200 and direction in ("east", "west")
    _, _, after_hint = w.http("GET", f"{base}/api/sessions/{sid}")
    checks["hint did not change state"] = after_hint == east
    if not os.path.isfile(retained_path) and checks["GET agrees with East"]:
        w.write_json(retained_path, east)
        evidence["retainedForLaterChecks"] = sid
    evidence.update(checks={k: bool(v) for k, v in checks.items()}, newSession=sid, hint=hint)
    index = next_index(os.path.join(ws, "checks"), "check")
    path = os.path.join(ws, "checks", f"check-{index:03d}.json")
    w.write_json(path, evidence)
    w.say(f"health release: {evidence['healthRelease']}")
    for name, ok in checks.items():
        w.say(f"  {'ok  ' if ok else 'FAIL'} {name}")
    passed = all(checks.values())
    w.say(f"{'PASS' if passed else 'FAIL'} functional check through {base} (record {path})")
    return 0 if passed else 1


def service_url(ws):
    if os.environ.get("W5_SERVICE_URL"):
        return os.environ["W5_SERVICE_URL"]
    records = sorted(glob.glob(os.path.join(ws, "deployments", "deployment-*.json")))
    if not records:
        w.fail("nothing has been synced yet: run release.py sync first")
    return w.read_json(records[-1])["serviceUrl"]


def cmd_check(args):
    ws = os.path.abspath(args.workspace)
    load_state(ws)
    return run_check(ws, service_url(ws))


def cmd_stop(args):
    ws = os.path.abspath(args.workspace)
    stop_local(ws, load_state(ws))
    w.say("Local runtime stopped. Retained storage was kept (podman volume / retained-data).")
    return 0


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("command", choices=["init", "pipeline", "select", "sync", "check", "stop"])
    parser.add_argument("--workspace", required=True)
    parser.add_argument("--image")
    args = parser.parse_args()
    return {"init": cmd_init, "pipeline": cmd_pipeline, "select": cmd_select, "sync": cmd_sync,
            "check": cmd_check, "stop": cmd_stop}[args.command](args)


if __name__ == "__main__":
    sys.exit(main())

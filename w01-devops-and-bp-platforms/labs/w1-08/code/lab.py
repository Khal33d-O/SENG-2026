"""W1.08 supplied adapter: declared YAML -> Argo CD sync -> Kubernetes resources -> Service response.

Run from the lab's code/ folder:
  python3 lab.py init     --scenario guided|challenge --workspace work/NAME
  python3 lab.py sync     --workspace work/NAME --revision FULL_COMMIT
  python3 lab.py inspect  --workspace work/NAME
  python3 lab.py check    --workspace work/NAME --expect a|b
  python3 lab.py backup   --workspace work/NAME
  python3 lab.py down     --workspace work/NAME

Back ends
  classroom  W108_ENV names the facilitator's preparation record (JSON: tool paths, kubeconfig, Git transport,
             in-cluster caller Pod, verified image IDs). Uses real git, kubectl and `argocd --core`.
             This back end could not be executed when these materials were authored (no cluster available);
             the facilitator must rehearse it in the prepared classroom environment.
  mock       used when W108_ENV is NOT set. Every output is labelled "LOCAL MOCK - not Kubernetes/Argo CD".
             It reads the YAML at the selected revision and simulates Argo comparison, Deployment Pods,
             Service selection (EndpointSlice) and the HTTP response from the selected Pod's image files.
Requires PyYAML (prepared tool, 6.0.2).
"""

import argparse
import datetime as dt
import hashlib
import json
import os
import re
import secrets
import shutil
import subprocess
import sys
from pathlib import Path

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
try:
    import yaml
except ImportError:  # pragma: no cover
    print("PREPARATION REQUIRED: PyYAML is not installed (facilitator: pip install PyYAML==6.0.2).")
    raise SystemExit(4)

IMAGES = {  # supplied image labels -> page files (the same files the facilitator builds into the real images)
    "localhost/academy-w108-author:a": HERE / "prepare" / "a",
    "localhost/academy-w108-author:b": HERE / "prepare" / "b",
}
MOCK = "LOCAL MOCK - not Kubernetes/Argo CD"


def now(fmt="%Y-%m-%dT%H:%M:%SZ"):
    return dt.datetime.now(dt.timezone.utc).strftime(fmt)


def sha(data):
    return hashlib.sha256(data).hexdigest()


def git(ws, *args, check=True):
    env = dict(os.environ, GIT_CONFIG_NOSYSTEM="1", GIT_CONFIG_GLOBAL=os.devnull)
    r = subprocess.run(["git", "-C", str(ws / "configuration"), *args], stdout=subprocess.PIPE, stderr=subprocess.PIPE, env=env)
    if check and r.returncode != 0:
        raise SystemExit(f"git {' '.join(args)} failed: {r.stderr.decode().strip()}")
    return r.stdout.decode("utf-8")


def workspace(path):
    ws = (HERE / path).resolve()
    info = ws / "workspace.json"
    if not info.is_file():
        raise SystemExit(f"FAIL: {ws} is not a W1.08 workspace (no workspace.json). Check --workspace.")
    return ws, json.loads(info.read_text(encoding="utf-8"))


def mock_image_id(image):
    folder = IMAGES[image]
    data = b"".join(sha(p.read_bytes()).encode() for p in sorted(folder.iterdir()))
    return "sha256:" + sha(data)


def expected_id(image, info):
    if info["backend"] == "classroom":
        return load_env()["images"].get(image)
    return mock_image_id(image) if image in IMAGES else None


# ------------------------------------------------------------------ YAML model
def load_resources(text):
    """Parse the supplied kind: List file and return its items, validating the fields this lab uses."""
    try:
        doc = yaml.safe_load(text)
    except yaml.YAMLError as exc:
        raise SystemExit(f"FAIL (before synchronization): YAML parse error: {exc}")
    if not isinstance(doc, dict) or doc.get("kind") != "List" or not isinstance(doc.get("items"), list):
        raise SystemExit("FAIL (before synchronization): expected the supplied kind: List wrapper with items")
    errors = []
    for item in doc["items"]:
        kind, name = item.get("kind"), (item.get("metadata") or {}).get("name")
        if kind == "Deployment":
            spec = item.get("spec") or {}
            if "image" in spec:
                errors.append(f"Deployment {name}: 'image' is not a Deployment spec field (it belongs to a template container)")
            try:
                c = spec["template"]["spec"]["containers"][0]
                c["image"]; spec["template"]["metadata"]["labels"]
            except (KeyError, IndexError, TypeError):
                errors.append(f"Deployment {name}: spec.template.spec.containers[0].image and template labels are required")
        elif kind == "Service":
            spec = item.get("spec") or {}
            if not isinstance(spec.get("selector"), dict) or not spec.get("ports"):
                errors.append(f"Service {name}: selector mapping and ports are required")
        elif kind not in ("ConfigMap",):
            errors.append(f"unexpected kind {kind}")
    if errors:
        raise SystemExit("FAIL (resource validation, before synchronization):\n  " + "\n  ".join(errors))
    return doc["items"]


def by_kind(items, kind):
    return [i for i in items if i.get("kind") == kind]


# ------------------------------------------------------------------ mock back end
class Mock:
    label = MOCK

    def state_file(self, ws):
        return ws / "mock-cluster.json"

    def sync(self, ws, info, revision, items):
        sf = self.state_file(ws)
        state = json.loads(sf.read_text(encoding="utf-8")) if sf.is_file() else {"pods": []}
        pods_after, degraded = [], False
        for d in by_kind(items, "Deployment"):
            name = d["metadata"]["name"]
            tmpl = d["spec"]["template"]
            c = tmpl["spec"]["containers"][0]
            thash = sha(json.dumps(tmpl, sort_keys=True).encode())[:10]
            current = [p for p in state["pods"] if p["deployment"] == name]
            same = [p for p in current if p["template_hash"] == thash]
            if same:
                pods_after += same
                continue
            pod = {"deployment": name, "template_hash": thash, "name": f"{name}-{thash[:6]}-{secrets.token_hex(3)[:5]}",
                   "labels": tmpl["metadata"]["labels"], "image": c["image"], "ports": c.get("ports", [])}
            if c["image"] in IMAGES:
                pod.update(ready=True, image_id=mock_image_id(c["image"]), reason="Running")
                pods_after.append(pod)  # old Pods for this Deployment are replaced after the new one is ready
            else:
                pod.update(ready=False, image_id=None, reason="ErrImageNeverPull")
                pods_after += [pod] + [p for p in current if p.get("ready")]  # rollout stalls; old replica stays
                degraded = True
        state = {"revision": revision, "sync": "Synced", "health": "Degraded" if degraded else "Healthy",
                 "operation": "Succeeded", "synced_at": now(), "resources": items, "pods": pods_after}
        sf.write_text(json.dumps(state, indent=2) + "\n", encoding="utf-8")

    def observe(self, ws, info, obs_dir):
        sf = self.state_file(ws)
        if not sf.is_file():
            raise SystemExit("No synchronized state yet: run sync with your full revision first.")
        st = json.loads(sf.read_text(encoding="utf-8"))
        items = st["resources"]
        head = git(ws, "rev-parse", "HEAD").strip()
        o = {"backend": self.label, "application": {"revision": st["revision"], "head": head,
             "sync": st["sync"] if st["revision"] == head else "OutOfSync", "health": st["health"], "operation": st["operation"]}}
        o["deployments"] = []
        for d in by_kind(items, "Deployment"):
            n = d["metadata"]["name"]
            o["deployments"].append({"name": n, "image": d["spec"]["template"]["spec"]["containers"][0]["image"],
                                     "replicas": d["spec"].get("replicas", 1),
                                     "available": sum(1 for p in st["pods"] if p["deployment"] == n and p["ready"])})
        o["pods"] = [{k: p.get(k) for k in ("name", "deployment", "labels", "image", "image_id", "ready", "reason")} for p in st["pods"]]
        svc = by_kind(items, "Service")[0]
        sel = svc["spec"]["selector"]
        o["service"] = {"name": svc["metadata"]["name"], "selector": sel, "ports": svc["spec"]["ports"]}
        eps = [p for p in st["pods"] if p["ready"] and all(p["labels"].get(k) == v for k, v in sel.items())]
        o["endpoints"] = [{"pod": p["name"], "ready": True} for p in eps]
        cms = by_kind(items, "ConfigMap")
        o["configmap"] = cms[0].get("data", {}) if cms else {}
        # The in-cluster caller requests http://<service>:8080/; the Service forwards to targetPort on ONE ready endpoint.
        port = svc["spec"]["ports"][0]
        resp = {"url": f"http://{svc['metadata']['name']}:{port['port']}/", "status": None}
        if eps:
            pod = sorted(eps, key=lambda p: p["name"])[0]
            names = {p.get("name"): p.get("containerPort") for p in pod.get("ports", [])}
            target = port.get("targetPort")
            if (isinstance(target, str) and target in names) or target == 80:
                folder = IMAGES[pod["image"]]
                (obs_dir / "page.html").write_bytes((folder / "index.html").read_bytes())
                (obs_dir / "site.css").write_bytes((folder / "site.css").read_bytes())
                resp.update(status=200, answered_by=pod["name"])
        o["response"] = resp
        return o

    def down(self, ws, info):
        sf = self.state_file(ws)
        if sf.exists():
            sf.unlink()
        print(f"{self.label}: removed the simulated Application/namespace state for {info['namespace']}")


# ------------------------------------------------------------------ classroom back end
def load_env():
    p = os.environ.get("W108_ENV")
    try:
        return json.loads(Path(p).read_text(encoding="utf-8"))
    except (TypeError, OSError, json.JSONDecodeError) as exc:
        raise SystemExit(f"PREPARATION REQUIRED: cannot read W108_ENV preparation record ({exc})")


class Classroom:
    """Real back end. Expected W108_ENV keys: kubectl, argocd, kubeconfig, git_transport (URL template with {name}),
    argocd_namespace, caller {namespace, pod}, images {label: image_id}. Never copy the kubeconfig into evidence."""
    label = "classroom (kubectl + argocd --core)"

    def __init__(self):
        self.env = load_env()

    def run(self, *args, check=True):
        e = dict(os.environ, KUBECONFIG=self.env["kubeconfig"], ARGOCD_OPTS="--core")
        print("$ " + " ".join(args))
        r = subprocess.run(list(args), stdout=subprocess.PIPE, stderr=subprocess.STDOUT, env=e)
        out = r.stdout.decode("utf-8", "replace")
        if check and r.returncode != 0:
            raise SystemExit(f"FAIL ({args[0]} exit {r.returncode}): {out.strip()[:800]}")
        return out

    def kube(self, ns, *args):
        return json.loads(self.run(self.env["kubectl"], "-n", ns, *args, "-o", "json"))

    def sync(self, ws, info, revision, items):
        remote = self.env["git_transport"].format(name=info["name"])
        git(ws, "push", "--force", remote, f"{revision}:refs/heads/main")  # transport only; approval is separate
        app = info["application"]
        self.run(self.env["argocd"], "app", "sync", app, "--revision", revision, "--core")
        self.run(self.env["argocd"], "app", "wait", app, "--sync", "--health", "--timeout", "120", "--core", check=False)

    def observe(self, ws, info, obs_dir):
        ns, appname = info["namespace"], info["application"]
        app = self.kube(self.env.get("argocd_namespace", "argocd"), "get", "application", appname)
        st = app.get("status", {})
        head = git(ws, "rev-parse", "HEAD").strip()
        o = {"backend": self.label, "application": {"revision": st.get("sync", {}).get("revision"), "head": head,
             "sync": st.get("sync", {}).get("status"), "health": st.get("health", {}).get("status"),
             "operation": st.get("operationState", {}).get("phase")}}
        deps = self.kube(ns, "get", "deployments")["items"]
        o["deployments"] = [{"name": d["metadata"]["name"], "image": d["spec"]["template"]["spec"]["containers"][0]["image"],
                             "replicas": d["spec"].get("replicas"), "available": d.get("status", {}).get("availableReplicas", 0)}
                            for d in deps]
        pods = self.kube(ns, "get", "pods")["items"]
        o["pods"] = []
        for p in pods:
            cs = (p.get("status", {}).get("containerStatuses") or [{}])[0]
            o["pods"].append({"name": p["metadata"]["name"], "labels": p["metadata"].get("labels", {}),
                              "image": p["spec"]["containers"][0]["image"], "image_id": cs.get("imageID"),
                              "ready": bool(cs.get("ready")),
                              "reason": (cs.get("state", {}).get("waiting") or {}).get("reason", "Running")})
        svc = self.kube(ns, "get", "service", "page")
        o["service"] = {"name": "page", "selector": svc["spec"].get("selector", {}), "ports": svc["spec"]["ports"]}
        slices = self.kube(ns, "get", "endpointslices", "-l", "kubernetes.io/service-name=page")["items"]
        o["endpoints"] = [{"pod": (e.get("targetRef") or {}).get("name"), "ready": e.get("conditions", {}).get("ready")}
                          for s in slices for e in (s.get("endpoints") or [])]
        cm = self.kube(ns, "get", "configmap", "page-settings")
        o["configmap"] = cm.get("data", {})
        caller = self.env["caller"]
        url = f"http://page.{ns}.svc.cluster.local:8080/"
        o["response"] = {"url": url, "status": None}
        try:
            page = self.run(self.env["kubectl"], "-n", caller["namespace"], "exec", caller["pod"], "--", "wget", "-qO-", url)
            css = self.run(self.env["kubectl"], "-n", caller["namespace"], "exec", caller["pod"], "--", "wget", "-qO-", url + "site.css")
            (obs_dir / "page.html").write_text(page, encoding="utf-8", newline="\n")
            (obs_dir / "site.css").write_text(css, encoding="utf-8", newline="\n")
            o["response"]["status"] = 200
        except SystemExit as exc:
            o["response"]["error"] = str(exc)
        return o

    def down(self, ws, info):
        self.run(self.env["argocd"], "app", "delete", info["application"], "--yes", "--core", check=False)
        self.run(self.env["kubectl"], "delete", "namespace", info["namespace"], "--wait=false", check=False)


def backend(info):
    return Classroom() if info["backend"] == "classroom" else Mock()


# ------------------------------------------------------------------ commands
def new_obs_dir(ws, what):
    d = ws / "observations" / f"{now('%Y%m%dT%H%M%SZ')}-{what}-{secrets.token_hex(2)}"
    d.mkdir(parents=True)
    return d


def cmd_init(a):
    ws = (HERE / a.workspace).resolve()
    if ws.exists():
        print(f"REFUSED: {ws} already exists. Initialise a different workspace; earlier attempts are kept."); return 2
    name = re.sub(r"[^a-z0-9-]", "-", ws.name.lower())
    classroom = bool(os.environ.get("W108_ENV"))
    info = {"scenario": a.scenario, "name": name, "namespace": f"w108-{name}", "application": f"w108-{name}",
            "backend": "classroom" if classroom else "mock", "created": now()}
    (ws / "configuration" / "app").mkdir(parents=True)
    shutil.copy2(HERE / a.scenario / "resources.yaml", ws / "configuration" / "app" / "resources.yaml")
    git(ws, "init", "--quiet", "--initial-branch=main")
    for k, v in (("user.name", "learner-a"), ("user.email", "learner@example.invalid"), ("commit.gpgsign", "false"),
                 ("core.autocrlf", "false")):
        git(ws, "config", "--local", k, v)
    git(ws, "add", "app/resources.yaml")
    git(ws, "commit", "--quiet", "-m", f"Supplied {a.scenario} configuration")
    shutil.copy2(HERE.parent / "annotations.md", ws / "annotations.md")
    (ws / "workspace.json").write_text(json.dumps(info, indent=2) + "\n", encoding="utf-8")
    if not classroom:
        print(f"[{MOCK}] W108_ENV is not set, so this workspace uses the local mock back end.")
    print(f"initialised {a.scenario} workspace {ws}; namespace {info['namespace']}; Application {info['application']}")
    print("selected commit: " + git(ws, "rev-parse", "HEAD").strip())
    return 0


def cmd_sync(a):
    ws, info = workspace(a.workspace)
    head = git(ws, "rev-parse", "HEAD").strip()
    if not re.fullmatch(r"[0-9a-f]{40}", a.revision or ""):
        print("REJECTED: --revision must be the complete 40-character commit printed by git rev-parse HEAD."); return 2
    if a.revision != head:
        print(f"REJECTED: {a.revision} is not the current committed revision ({head}); stale or different input."); return 2
    if git(ws, "status", "--porcelain", "--", "app/resources.yaml").strip():
        print("REJECTED: app/resources.yaml has uncommitted changes. Commit the intended YAML first."); return 2
    items = load_resources(git(ws, "show", f"{a.revision}:app/resources.yaml"))
    be = backend(info)
    print(f"[{be.label}] synchronizing {info['application']} to revision {a.revision}")
    be.sync(ws, info, a.revision, items)
    return cmd_inspect(a, quiet_header=True)


def observe(ws, info, what):
    d = new_obs_dir(ws, what)
    o = backend(info).observe(ws, info, d)
    (d / "observation.json").write_text(json.dumps(o, indent=2) + "\n", encoding="utf-8")
    return o, d


def print_view(o, d):
    ap = o["application"]
    print(f"[{o['backend']}]")
    print(f"Application: revision {ap['revision']}  sync {ap['sync']}  health {ap['health']}  operation {ap['operation']}")
    for dep in o["deployments"]:
        print(f"Deployment {dep['name']}: image {dep['image']}  available {dep['available']}/{dep['replicas']}")
    print(f"Service {o['service']['name']}: selector {o['service']['selector']}  ports {o['service']['ports']}")
    for p in o["pods"]:
        print(f"Pod {p['name']}: labels {p['labels']} image {p['image']} imageID {p['image_id']} ready {p['ready']} ({p['reason']})")
    print("EndpointSlice (selected ready endpoints): " + (", ".join(e["pod"] for e in o["endpoints"]) or "none"))
    print(f"ConfigMap page-settings: {o['configmap']}")
    r = o["response"]
    title = ""
    if (d / "page.html").is_file():
        m = re.search(r"<h1>(.*?)</h1>", (d / "page.html").read_text(encoding="utf-8"))
        title = m.group(1) if m else ""
    print(f"Service request {r['url']}: " + (f"HTTP {r['status']} '{title}'" + (f" (answered by {r.get('answered_by')})" if r.get("answered_by") else "")
                                             if r["status"] else "no HTTP response"))
    print(f"observation directory: {d}")


def cmd_inspect(a, quiet_header=False):
    ws, info = workspace(a.workspace)
    o, d = observe(ws, info, "inspect")
    print_view(o, d)
    return 0


def cmd_check(a):
    ws, info = workspace(a.workspace)
    o, d = observe(ws, info, f"check-{a.expect}")
    print_view(o, d)
    want = f"localhost/academy-w108-author:{a.expect}"
    files = IMAGES[want]
    results = []

    def c(ok, label):
        results.append(ok); print(("PASS " if ok else "FAIL ") + label)

    ap = o["application"]
    c(ap["revision"] == ap["head"] and ap["sync"] == "Synced", "Argo reports the current committed revision Synced")
    c(ap["health"] == "Healthy" and ap["operation"] == "Succeeded", "health Healthy and operation Succeeded")
    deps = {dp["name"]: dp for dp in o["deployments"]}
    main = deps.get("main-page", {})
    c(main.get("image") == want and main.get("available", 0) >= 1, f"main-page declares {want} and has an available replica")
    if info["scenario"] == "challenge":
        pv = deps.get("preview-page", {})
        c(pv.get("image") == "localhost/academy-w108-author:a" and pv.get("available", 0) == 1 and pv.get("replicas") == 1,
          "preview-page remains available on supplied A (image, 1 replica)")
    page_ok = (d / "page.html").is_file() and (d / "page.html").read_bytes() == (files / "index.html").read_bytes()
    css_ok = (d / "site.css").is_file() and (d / "site.css").read_bytes() == (files / "site.css").read_bytes()
    c(o["response"]["status"] == 200 and page_ok and css_ok, f"Service returns the exact release-{a.expect.upper()} page and stylesheet")
    pods = {p["name"]: p for p in o["pods"]}
    sel = [pods.get(e["pod"]) for e in o["endpoints"] if e.get("ready")]
    ident = expected_id(want, info)
    c(bool(sel) and all(p and p["image_id"] and ident and ident.split(":")[-1] in p["image_id"] for p in sel),
      "every selected ready endpoint runs the prepared image identity for " + want)
    ok = all(results)
    print("RESULT: " + ("PASS" if ok else "FAIL") + f" (check --expect {a.expect}; no repair was applied)")
    return 0 if ok else 1


def cmd_backup(a):
    ws, info = workspace(a.workspace)
    need = [ws / "configuration" / "app" / "resources.yaml", ws / "annotations.md"]
    missing = [str(p) for p in need if not p.is_file()]
    if missing:
        print("FAIL: required file(s) missing, no backup created: " + ", ".join(missing)); return 1
    d = ws / "backups" / f"{now('%Y%m%dT%H%M%SZ')}-{secrets.token_hex(3)}"
    d.mkdir(parents=True)
    for p in need:
        shutil.copy2(p, d / p.name)
    (d / "commit.txt").write_text(git(ws, "rev-parse", "HEAD"), encoding="utf-8")
    (d / "git-log.txt").write_text(git(ws, "log", "--oneline"), encoding="utf-8")
    print(f"backup created {d} (resources.yaml, annotations.md, commit.txt, git-log.txt)")
    return 0


def cmd_down(a):
    ws, info = workspace(a.workspace)
    backend(info).down(ws, info)
    print("Source, Git history, observations and backups are kept.")
    return 0


def main():
    p = argparse.ArgumentParser(description="W1.08 adapter")
    sub = p.add_subparsers(dest="cmd", required=True)
    s = sub.add_parser("init"); s.add_argument("--scenario", choices=["guided", "challenge"], required=True)
    s.add_argument("--workspace", required=True)
    s = sub.add_parser("sync"); s.add_argument("--workspace", required=True); s.add_argument("--revision", required=True)
    s = sub.add_parser("check"); s.add_argument("--workspace", required=True); s.add_argument("--expect", choices=["a", "b"], required=True)
    for n in ("inspect", "backup", "down"):
        sub.add_parser(n).add_argument("--workspace", required=True)
    a = p.parse_args()
    return {"init": cmd_init, "sync": cmd_sync, "inspect": cmd_inspect, "check": cmd_check,
            "backup": cmd_backup, "down": cmd_down}[a.cmd](a)


if __name__ == "__main__":
    sys.exit(main())

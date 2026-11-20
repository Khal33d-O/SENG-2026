"""Start the W3.09 local view: the hint application plus (when prepared) Loki and Grafana.

  python3 launch.py demo       complete known instrumentation (demo/src/instrumentation.ts)
  python3 launch.py starter    your current starter/src/instrumentation.ts

The application uses controlled local responses only; no model provider is called. Loki and Grafana run
from Podman images that the delivery environment has already prepared. This launcher NEVER downloads
images (--pull=never). If they are unavailable, the application still runs and every terminal event is
kept in the printed run directory as LOCAL evidence (it is not Grafana evidence).

Ctrl+C stops only the processes and containers this launcher started (label academy.owner=<run id>).
On Windows use `python` or `py -3` instead of `python3`.
"""
import json, os, shutil, subprocess, sys, threading, time, urllib.request

LAB = os.path.dirname(os.path.abspath(__file__))
APP_PORT, LOKI_PORT, GRAFANA_PORT = 4309, 3109, 3009
LOKI_IMAGE = os.environ.get("W309_LOKI_IMAGE", "docker.io/grafana/loki:3.5.0")
GRAFANA_IMAGE = os.environ.get("W309_GRAFANA_IMAGE", "docker.io/grafana/grafana:12.1.0")
SESSION = os.environ.get("LAB_SESSION", "learner-01")  # synthetic, owned session label
JOB = "academy-w309"


def find_tsc():
    local = os.path.join(LAB, "node_modules", "typescript", "bin", "tsc")
    if os.path.exists(local):
        return ["node", local]
    found = shutil.which("tsc")
    if not found:
        sys.exit("TypeScript 5.9.3 not found: run `npm ci` once in this lab directory.")
    return [found]


def build(variant, run_dir):
    app = os.path.join(run_dir, "app")
    shutil.copytree(os.path.join(LAB, "starter"), app, ignore=shutil.ignore_patterns("node_modules", "dist"))
    if variant == "demo":
        shutil.copy(os.path.join(LAB, "demo", "src", "instrumentation.ts"), os.path.join(app, "src", "instrumentation.ts"))
    # The run directory lives inside the lab, so the lab's node_modules resolves by walking up.
    subprocess.run(find_tsc() + ["-p", "tsconfig.json"], cwd=app, check=True)
    return app


def podman(*args, check=False):
    return subprocess.run(["podman", *args], capture_output=True, text=True, check=check)


def start_collector(run_id):
    """Start Loki and Grafana if Podman and the prepared images exist. Returns True when started."""
    if not shutil.which("podman"):
        print("collector: podman not found; local terminal evidence only.")
        return False
    for image in (LOKI_IMAGE, GRAFANA_IMAGE):
        if podman("image", "exists", image).returncode != 0:
            print(f"collector: prepared image {image} is not available (the launcher never downloads images); "
                  "local terminal evidence only.")
            return False
    label = f"academy.owner={run_id}"
    net = f"{run_id}-net"
    podman("network", "create", "--label", label, net)
    podman("run", "-d", "--pull=never", "--rm", "--label", label, "--network", net, "--name", f"{run_id}-loki",
           "-p", f"127.0.0.1:{LOKI_PORT}:3100", LOKI_IMAGE, check=True)
    prov = os.path.join(LAB, "collector", "grafana", "provisioning")
    dash = os.path.join(LAB, "collector", "grafana", "dashboards")
    podman("run", "-d", "--pull=never", "--rm", "--label", label, "--network", net, "--name", f"{run_id}-grafana",
           "-p", f"127.0.0.1:{GRAFANA_PORT}:3000",
           "-e", "GF_AUTH_ANONYMOUS_ENABLED=true", "-e", "GF_AUTH_ANONYMOUS_ORG_ROLE=Viewer",
           "-e", f"LOKI_URL=http://{run_id}-loki:3100",
           "-v", f"{prov}:/etc/grafana/provisioning:ro", "-v", f"{dash}:/var/lib/grafana/dashboards:ro",
           GRAFANA_IMAGE, check=True)
    return True


def stop_collector(run_id):
    for kind in ("container", "network"):
        listing = podman(kind, "ls", "-q", "--filter", f"label=academy.owner={run_id}")
        for ident in listing.stdout.split():
            podman(kind, "rm", "-f", ident) if kind == "container" else podman("network", "rm", ident)


def push_events(events_file, stop, loki_url):
    """Tail the terminal event file and push each line to Loki with bounded stream labels only."""
    offset = 0
    while not stop.is_set():
        time.sleep(0.5)
        if not os.path.exists(events_file):
            continue
        with open(events_file, encoding="utf-8") as f:
            f.seek(offset)
            lines = f.readlines()
            offset = f.tell()
        values = [[str(time.time_ns()), line.strip()] for line in lines if line.strip()]
        if not values:
            continue
        body = json.dumps({"streams": [{"stream": {"job": JOB, "session": SESSION}, "values": values}]}).encode()
        request = urllib.request.Request(f"{loki_url}/loki/api/v1/push", data=body, headers={"content-type": "application/json"})
        try:
            urllib.request.urlopen(request, timeout=5).read()
        except OSError as error:
            print(f"collector: push failed ({error}); events remain in {events_file}")


def main(argv):
    variant = argv[1] if len(argv) > 1 else "starter"
    if variant not in ("demo", "starter"):
        sys.exit("usage: python3 launch.py demo|starter")
    run_id = f"w309-{variant}-{time.strftime('%Y%m%d-%H%M%S')}"
    run_dir = os.path.join(LAB, "runs", run_id)
    os.makedirs(run_dir)
    app = build(variant, run_dir)
    events_file = os.path.join(run_dir, "events.jsonl")
    collector = start_collector(run_id)
    stop = threading.Event()
    if collector:
        threading.Thread(target=push_events, args=(events_file, stop, f"http://127.0.0.1:{LOKI_PORT}"), daemon=True).start()
    server = subprocess.Popen(["node", "dist/server.js", "--controls", "--port", str(APP_PORT), "--events-file", events_file], cwd=app)
    print(f"\nRun directory (keep it as evidence): {run_dir}")
    print(f"Application: http://127.0.0.1:{APP_PORT}")
    if collector:
        print(f"Grafana:     http://127.0.0.1:{GRAFANA_PORT}/d/w309-hints  (session {SESSION}; paste the request ID)")
    else:
        print("Grafana:     not started - record your own Grafana observation as unverified.")
    print("Keep this terminal open. Ctrl+C stops only what this launcher started.\n")
    try:
        server.wait()
    except KeyboardInterrupt:
        pass
    finally:
        stop.set()
        server.terminate()
        if collector:
            stop_collector(run_id)
        print(f"Stopped. Events and setup evidence retained in {run_dir}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))

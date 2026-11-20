"""W1.05 supplied test helper: build an image, then check actual bytes in the image and over HTTP.

Run from this lab folder:
  python3 lab.py prepare  [--engine docker|podman]       explicit pull of the pinned NGINX base
  python3 lab.py guided   [--engine ...]                 build + verify guided/Dockerfile (context guided)
  python3 lab.py baseline [--engine ...]                 unedited starter must serve the NGINX welcome page
  python3 lab.py test --variant core|changed --tag IMAGE [--engine ...]

Every engine command is printed. The helper picks a free loopback port, runs ONE temporary container that it
names itself (w105-check-...), checks bytes, and removes only that container. Images are kept and their IDs printed.
It never judges your explanation. Required checks use the local base image (--pull=never).
"""

import argparse
import os
import secrets
import socket
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
BASE = ("docker.io/library/nginx:1.30.4-trixie"
        "@sha256:d5792f71a9496b833bc08ea834a758c46e2b6a6306c10f4be926f38a656cdc1c")
DOCROOT = "/usr/share/nginx/html"
EXPECTED = HERE / "tests" / "expected"


class Lab:
    def __init__(self, engine):
        self.engine = engine
        self.failures = 0

    def run(self, args, show=True):
        cmd = [self.engine, *args]
        print("$ " + " ".join(cmd))
        try:
            r = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
        except FileNotFoundError:
            print(f"ENVIRONMENT BLOCKED: '{self.engine}' not found. Use --engine podman or ask the facilitator.")
            raise SystemExit(4)
        out = r.stdout
        if show and out.strip():
            text = out.decode("utf-8", "replace").rstrip()
            lines = text.splitlines()
            print("  " + "\n  ".join(lines[-12:]))
        return r.returncode, out

    def check(self, ok, label):
        print(("PASS " if ok else "FAIL ") + label)
        if not ok:
            self.failures += 1
        return ok

    def build(self, dockerfile, tag, context):
        code, _ = self.run(["build", "--pull=never", "-f", dockerfile, "-t", tag, context])
        if code != 0:
            print("FAIL build: read the first failed stage above (a missing COPY source points to the context).")
            raise SystemExit(1)
        _, out = self.run(["image", "inspect", "--format", "{{.Id}}", tag], show=False)
        print(f"image {tag} -> ID {out.decode().strip()}")

    def image_file(self, tag, path):
        code, out = self.run(["run", "--rm", "--entrypoint", "cat", tag, path], show=False)
        return out if code == 0 else None

    def serve(self, tag):
        port = free_port()
        name = "w105-check-" + secrets.token_hex(3)
        code, _ = self.run(["run", "--detach", "--name", name, "-p", f"127.0.0.1:{port}:80", tag])
        if code != 0:
            print("FAIL could not start the temporary container"); raise SystemExit(1)
        base = f"http://127.0.0.1:{port}"
        for _ in range(30):
            if get(base + "/")[0] is not None:
                break
            time.sleep(0.5)
        print(f"temporary URL {base}/ (container {name})")
        return name, base

    def remove(self, name):
        self.run(["rm", "--force", name], show=False)


def free_port():
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def get(url):
    try:
        with urllib.request.urlopen(url, timeout=3) as r:
            return r.status, r.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read()
    except (urllib.error.URLError, OSError):
        return None, b""


def check_release(lab, tag, expected_dir, forbidden=False):
    page = (expected_dir / "index.html").read_bytes()
    css = (expected_dir / "site.css").read_bytes()
    lab.check(lab.image_file(tag, f"{DOCROOT}/index.html") == page, f"image file {DOCROOT}/index.html matches the requested page")
    lab.check(lab.image_file(tag, f"{DOCROOT}/site.css") == css, f"image file {DOCROOT}/site.css matches the requested stylesheet")
    if forbidden:
        _, out = lab.run(["run", "--rm", "--entrypoint", "find", tag, DOCROOT, "-name", "briefing.txt"], show=False)
        lab.check(out.strip() == b"", "internal fixture briefing.txt is absent from the document tree")
    name, base = lab.serve(tag)
    try:
        status, body = get(base + "/")
        lab.check(status == 200 and body == page, f"GET / -> {status}, exact requested page")
        status, body = get(base + "/site.css")
        lab.check(status == 200 and body == css, f"GET /site.css -> {status}, exact requested stylesheet")
        if forbidden:
            for path in ("/briefing.txt", "/internal/briefing.txt", "/delivery/blue/internal/briefing.txt"):
                status, _ = get(base + path)
                lab.check(status == 404, f"GET {path} -> {status} (internal fixture not served)")
    finally:
        lab.remove(name)


def main():
    p = argparse.ArgumentParser(description="W1.05 test helper")
    p.add_argument("command", choices=["prepare", "guided", "baseline", "test"])
    p.add_argument("--variant", choices=["core", "changed"])
    p.add_argument("--tag")
    p.add_argument("--engine", default=os.environ.get("ENGINE", "docker"))
    a = p.parse_args()
    lab = Lab(a.engine)
    os.chdir(HERE)

    if a.command == "prepare":
        code, _ = lab.run(["pull", BASE])
        return code
    if lab.run(["image", "inspect", "--format", "{{.Id}}", BASE], show=False)[0] != 0:
        print(f"ENVIRONMENT BLOCKED: pinned base {BASE} is not available locally. Run prepare (facilitator).")
        return 4
    if a.command == "guided":
        lab.build("guided/Dockerfile", "localhost/academy-w105:guided", "guided")
        check_release(lab, "localhost/academy-w105:guided", EXPECTED / "guided")
    elif a.command == "baseline":
        lab.build("starter/Dockerfile", "localhost/academy-w105:baseline", "starter")
        name, base = lab.serve("localhost/academy-w105:baseline")
        try:
            status, body = get(base + "/")
            lab.check(status == 200 and b"Welcome to nginx!" in body, f"GET / -> {status}, inherited NGINX welcome page")
        finally:
            lab.remove(name)
    else:
        if not a.variant or not a.tag:
            p.error("test needs --variant and --tag")
        lab.build("starter/Dockerfile", a.tag, "starter")
        check_release(lab, a.tag, EXPECTED / a.variant, forbidden=(a.variant == "changed"))
    print("RESULT: " + ("PASS" if lab.failures == 0 else f"FAIL ({lab.failures} check(s))"))
    return 0 if lab.failures == 0 else 1


if __name__ == "__main__":
    sys.exit(main())

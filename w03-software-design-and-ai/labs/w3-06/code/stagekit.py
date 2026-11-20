"""Supplied stage helper for W3.06 (used by harness.py and demo.py). Do not edit."""
import os, shutil, subprocess, sys, tempfile

CODE = os.path.dirname(os.path.abspath(__file__))
STARTER = os.path.join(CODE, "starter")
STAGES = os.path.join(CODE, "stages")


def tsc():
    local = os.path.join(STARTER, "node_modules", "typescript", "bin", "tsc")
    if os.path.exists(local):
        return ["node", local]
    found = shutil.which("tsc")
    if not found:
        sys.exit("TypeScript 5.9.3 not found. Prepared environment: run `npm ci` once in code/starter.")
    return [found]


def run_stage(label, overrides, tests):
    """Compile a fresh temporary copy of starter/ with `overrides` {relpath: stage file}, run `tests`.
    Returns (exit code, output). The temporary directory is removed afterwards."""
    tmp = tempfile.mkdtemp(prefix=f"w306-{label}-")
    try:
        work = os.path.join(tmp, "starter")
        shutil.copytree(STARTER, work, ignore=shutil.ignore_patterns("node_modules", "dist"))
        for target, source in overrides.items():
            shutil.copy(os.path.join(STAGES, source), os.path.join(work, target))
        build = subprocess.run(tsc() + ["-p", "tsconfig.json"], cwd=work, capture_output=True, text=True, encoding="utf-8", errors="replace")
        if build.returncode:
            return build.returncode, "COMPILE ERROR\n" + build.stdout + build.stderr
        r = subprocess.run(["node", "--test", "--test-reporter=spec", *tests], cwd=work, capture_output=True, text=True, encoding="utf-8", errors="replace")
        return r.returncode, r.stdout + r.stderr
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def summary(output):
    keep = []
    for line in output.splitlines():
        s = line.strip()
        if s.startswith(("✔", "✖", "ℹ tests", "ℹ pass", "ℹ fail", "COMPILE", "error TS")) or "AssertionError" in s or s.startswith(("+", "-", "actual", "expected")):
            keep.append("    " + line.rstrip())
    return "\n".join(dict.fromkeys(keep))

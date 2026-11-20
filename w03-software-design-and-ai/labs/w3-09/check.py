"""Compile a FRESH temporary copy of starter/ and run the named Node checks (the Makefile calls this).

  python3 check.py starter      what `make test` runs
  python3 check.py demo         what `make demo` runs (the complete demonstration file swapped in)
  python3 check.py <other>      see CONFIG below (e.g. timeout, malformed)

The temporary copy is removed afterwards, so generated output from another directory cannot supply a
stale success. Exit status is Node's (1 on a failed check); `make` reports 2 for the same failed recipe.
On Windows use `python` or `py -3` instead of `python3`.
"""
import os, shutil, subprocess, sys, tempfile

LAB = os.path.dirname(os.path.abspath(__file__))
TESTS = ["tests/evaluation.test.mjs", "tests/signals.test.mjs"]
CONFIG = {
    "starter": {"tests": TESTS + ["tests/diagnosis.test.mjs"], "label": "response, signal and selected-repeat checks",
                "summary": "PASS 24 response + 5 signal + selected-repeat checks; controlled local responses, no provider call."},
    "demo": {"swap": {"src/instrumentation.ts": "demo/src/instrumentation.ts"}, "tests": TESTS,
             "label": "complete demonstration checks", "summary": "PASS complete demonstration: 29 response and signal checks; no provider call."},
}


def find_tsc():
    for base in (LAB, os.path.join(LAB, "starter")):
        local = os.path.join(base, "node_modules", "typescript", "bin", "tsc")
        if os.path.exists(local):
            return ["node", local]
    found = shutil.which("tsc")
    if found:
        return [found]
    sys.exit("TypeScript 5.9.3 not found. Prepared environment: run `npm ci` once in this lab directory.")


def main(argv):
    name = argv[1] if len(argv) > 1 else "starter"
    if name not in CONFIG:
        sys.exit(f"unknown check '{name}'; choose one of: {', '.join(CONFIG)}")
    cfg = CONFIG[name]
    # Inside the lab so Node/TypeScript resolve the lab's node_modules by walking up; removed afterwards.
    tmp = tempfile.mkdtemp(prefix=f".check-{name}-", dir=LAB)
    try:
        work = os.path.join(tmp, "starter")
        shutil.copytree(os.path.join(LAB, "starter"), work, ignore=shutil.ignore_patterns("node_modules", "dist"))
        for target, source in cfg.get("swap", {}).items():
            shutil.copy(os.path.join(LAB, source), os.path.join(work, target))
            print(f"(using {source} as {target})", flush=True)
        build = subprocess.run(find_tsc() + ["-p", "tsconfig.json"], cwd=work)
        if build.returncode:
            print("FAIL compilation (no checks were executed)")
            return build.returncode
        if "script" in cfg:
            return subprocess.call(["node", cfg["script"]], cwd=work)
        code = subprocess.call(["node", "--test", "--test-reporter=tap"] + cfg["tests"], cwd=work)
        print(cfg["summary"] if code == 0 else f"FAIL {cfg['label']} (exit {code})")
        return code
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    sys.exit(main(sys.argv))

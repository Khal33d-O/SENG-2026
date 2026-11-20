"""W3.04 worked example 2 replay. Run from the lab's code directory:

  python3 demo.py unsupported     the supplied candidate that grants a free move when treasure is collected
  python3 demo.py corrected       the recorded correct source

Selects an explicit source, copies code/starter into a fresh temporary directory with that source as
src/rules.ts, compiles and runs the same five local checks. The replay invokes no model.
"""
import os, shutil, subprocess, sys, tempfile
if hasattr(sys.stdout, "reconfigure"):  # Windows consoles: print test-runner symbols safely
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

CODE = os.path.dirname(os.path.abspath(__file__))
SOURCES = {"unsupported": "candidates/unsupported.ts", "corrected": "candidates/corrected.ts"}


def main(argv):
    if len(argv) < 2 or argv[1] not in SOURCES:
        sys.exit("usage: python3 demo.py unsupported|corrected")
    source = os.path.join(CODE, SOURCES[argv[1]])
    tsc = os.path.join(CODE, "starter", "node_modules", "typescript", "bin", "tsc")
    if not os.path.exists(tsc):
        sys.exit("run `npm ci --ignore-scripts --no-audit --no-fund` in code/starter first")
    tmp = tempfile.mkdtemp(prefix=f"w304-demo-{argv[1]}-")
    try:
        work = os.path.join(tmp, "starter")
        shutil.copytree(os.path.join(CODE, "starter"), work, ignore=shutil.ignore_patterns("node_modules", "dist"))
        shutil.copy(source, os.path.join(work, "src", "rules.ts"))
        print(f"replaying {SOURCES[argv[1]]} in a fresh copy (no model call)", flush=True)
        subprocess.run(["node", tsc, "-p", "tsconfig.json"], cwd=work, check=True)
        return subprocess.call(["node", "--test", "tests/rules.test.mjs"], cwd=work)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    sys.exit(main(sys.argv))

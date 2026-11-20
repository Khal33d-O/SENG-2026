"""W4.03 selector checker (supplied - leave unchanged).

    python3 test_candidates.py --fixed-only   # ten fixed cases (30 assertions) against current source
    python3 test_candidates.py                # fixed cases + your two learner-cases.json orders (6 more)

Builds a disposable copy of this starter, runs the supplied assertion runner and prints its output.
The learner cases are validated first: each order uses the whole supplied pool, the two expected
positions differ, and at least one order starts with a blocked candidate.
Exit code 0 = everything passed, 1 = a failure.
"""
import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
ENV = dict(os.environ, DOTNET_NOLOGO="1", DOTNET_CLI_TELEMETRY_OPTOUT="1",
           DOTNET_SKIP_FIRST_TIME_EXPERIENCE="1")


def run(cmd, cwd):
    return subprocess.run(cmd, cwd=cwd, env=ENV, capture_output=True, text=True)


def is_open(p, board):
    if p["x"] < 0 or p["y"] < 0 or p["x"] >= board["width"] or p["y"] >= board["height"]:
        return False
    return not any(w["x"] == p["x"] and w["y"] == p["y"] for w in board["walls"])


def validate_learner(path, board):
    data = json.loads(path.read_text(encoding="utf-8"))
    pool = sorted((p["x"], p["y"]) for p in data["pool"])
    cases = data["cases"]
    problems = []
    if len(cases) != 2:
        problems.append("learner-cases.json must contain exactly two cases")
    for c in cases:
        order = sorted((p["x"], p["y"]) for p in c.get("candidates", []))
        if order != pool:
            problems.append(f"{c['id']}: 'candidates' must be an ordering of the whole pool {data['pool']}")
        if c.get("expected") is None:
            problems.append(f"{c['id']}: write the expected open position (an object with x and y)")
    if not problems:
        if cases[0]["expected"] == cases[1]["expected"]:
            problems.append("the two cases must have different expected positions")
        if not any(not is_open(c["candidates"][0], board) for c in cases):
            problems.append("at least one case must start with a blocked candidate")
    return problems


def main(argv):
    fixed_only = "--fixed-only" in argv
    work = Path(tempfile.mkdtemp(prefix="w4-03-check-"))
    copy = work / "starter"
    try:
        shutil.copytree(HERE, copy, ignore=shutil.ignore_patterns("bin", "obj", "caller-copy", "__pycache__"))
        build = run(["dotnet", "build", "Preflight.slnx", "--disable-build-servers", "-v", "q", "-nologo"], copy)
        if build.returncode != 0:
            print(build.stdout + build.stderr)
            print("FAIL build: the current source does not compile.")
            return 1

        def cases(name):
            proc = run(["dotnet", "run", "--project", "ConsoleApp/ConsoleApp.csproj", "--no-build", "--",
                        f"fixtures/{name}"], copy)
            print(proc.stdout.rstrip())
            if proc.stderr.strip():
                print(proc.stderr.strip())
            return proc.returncode == 0

        print("== Fixed cases: fixtures/candidate-cases.json")
        ok = cases("candidate-cases.json")
        if fixed_only:
            return 0 if ok else 1

        print("\n== Learner cases: fixtures/learner-cases.json")
        board = json.loads((copy / "fixtures" / "board-reference.json").read_text(encoding="utf-8"))
        problems = validate_learner(copy / "fixtures" / "learner-cases.json", board)
        if problems:
            for p in problems:
                print("INVALID " + p)
            ok = False
        else:
            ok = cases("learner-cases.json") and ok
        print("\nSelector check: " + ("PASSED" if ok else "FAILED"))
        return 0 if ok else 1
    finally:
        shutil.rmtree(work, ignore_errors=True)


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))

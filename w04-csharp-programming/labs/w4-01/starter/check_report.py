"""W4.01 console acceptance check (supplied - leave unchanged).

Builds a disposable copy of this starter, runs the console for F01-F04 and the
reporting budget probe, and checks two things separately for each case:

  * rule comparison  - the supplied FixtureReport printed PASS <id> (exit code 0)
  * console report   - your two lines are present with the returned values:
                         Result position: X,Y
                         Remaining moves: N

The expected report values are read from each fixture's independent "expected"
state, never from your program. Exit code 0 = all cases pass, 1 = something failed.

Run:  make test      or, without Make:  python3 check_report.py
"""
import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
CASES = [
    "fixtures/F01.json",
    "fixtures/F02.json",
    "fixtures/F03.json",
    "fixtures/F04.json",
    "tests/probes/P01.json",  # reporting budget probe: a board with 9 starting moves
]
ENV = dict(os.environ, DOTNET_NOLOGO="1", DOTNET_CLI_TELEMETRY_OPTOUT="1",
           DOTNET_SKIP_FIRST_TIME_EXPERIENCE="1")


def run(cmd, cwd):
    return subprocess.run(cmd, cwd=cwd, env=ENV, capture_output=True, text=True)


def expected_lines(case_path):
    state = json.loads(case_path.read_text(encoding="utf-8"))["expected"]["state"]
    pos = state["position"]
    return [
        f"Result position: {pos['x']},{pos['y']}",
        f"Remaining moves: {state['movesRemaining']}",
    ]


def main():
    work = Path(tempfile.mkdtemp(prefix="w4-01-check-"))
    copy = work / "starter"
    try:
        shutil.copytree(HERE, copy, ignore=shutil.ignore_patterns("bin", "obj", "TestResults", "__pycache__"))
        print("Building a disposable copy: dotnet build Preflight.slnx")
        build = run(["dotnet", "build", "Preflight.slnx", "--disable-build-servers", "-v", "q", "-nologo"], copy)
        if build.returncode != 0:
            print(build.stdout + build.stderr)
            print("FAIL build: the current source does not compile (fix the first error above).")
            return 1

        failures = 0
        for case in CASES:
            proc = run(["dotnet", "run", "--project", "ConsoleApp/ConsoleApp.csproj", "--no-build", "--", case], copy)
            lines = [line.rstrip() for line in proc.stdout.splitlines()]
            case_id = json.loads((copy / case).read_text(encoding="utf-8"))["id"]

            rule_ok = proc.returncode == 0 and f"PASS {case_id}" in lines
            print(f"{case_id} rule comparison: {'PASS' if rule_ok else 'FAIL'} (exit {proc.returncode})")
            if not rule_ok:
                failures += 1
                if proc.stderr.strip():
                    print("    stderr: " + proc.stderr.strip().splitlines()[0])

            for wanted in expected_lines(copy / case):
                label = wanted.split(":")[0] + ":"
                if wanted in lines:
                    print(f"{case_id} console report: PASS '{wanted}'")
                    continue
                failures += 1
                found = [line for line in lines if line.startswith(label)]
                if found:
                    print(f"{case_id} console report: FAIL expected '{wanted}' but printed '{found[0]}'")
                else:
                    print(f"{case_id} console report: FAIL missing line '{wanted}'")

        print()
        if failures:
            print(f"Console check: FAILED ({failures} problem(s) across {len(CASES)} cases)")
            return 1
        print(f"Console check: PASSED ({len(CASES)} cases: rule comparison and report lines)")
        return 0
    finally:
        shutil.rmtree(work, ignore_errors=True)


if __name__ == "__main__":
    sys.exit(main())

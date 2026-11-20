"""W4.02 typed-report acceptance check (supplied - leave unchanged).

Builds a disposable copy, then runs six fixed cases (fixture, mode, measurement). For each case it
checks the supplied rule comparison (PASS <id>) and every required report line. Expected values are
written here independently of your program.

Run:  make test      or, without Make:  python3 check_report.py
Exit code 0 = all six cases pass, 1 = something failed.
"""
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
ENV = dict(os.environ, DOTNET_NOLOGO="1", DOTNET_CLI_TELEMETRY_OPTOUT="1",
           DOTNET_SKIP_FIRST_TIME_EXPERIENCE="1")

# (fixture, mode, measurement, required lines)
CASES = [
    ("F02", "present", "2.75", ["Values: 1,0|0|playing", "Measurement: 2.75", "Whole part: 2",
                                "Optional score: 0", "Optional result: True|playing"]),
    ("F02", "absent", "3.5", ["Values: 1,0|0|playing", "Measurement: 3.5", "Whole part: 3",
                              "Optional score: absent", "Optional result: absent"]),
    ("F02", "score-only", "-2.75", ["Values: 1,0|0|playing", "Measurement: -2.75", "Whole part: -2",
                                    "Optional score: 0", "Optional result: absent"]),
    ("F03", "result-only", "2.75", ["Values: 1,0|0|playing", "Measurement: 2.75", "Whole part: 2",
                                    "Optional score: absent", "Optional result: False|playing"]),
    ("F03", "present", "3.5", ["Values: 1,0|0|playing", "Measurement: 3.5", "Whole part: 3",
                               "Optional score: 0", "Optional result: False|playing"]),
    ("F04", "absent", "-2.75", ["Values: 0,0|0|playing", "Measurement: -2.75", "Whole part: -2",
                                "Optional score: absent", "Optional result: absent"]),
]


def run(cmd, cwd):
    return subprocess.run(cmd, cwd=cwd, env=ENV, capture_output=True, text=True)


def main():
    work = Path(tempfile.mkdtemp(prefix="w4-02-check-"))
    copy = work / "starter"
    try:
        shutil.copytree(HERE, copy, ignore=shutil.ignore_patterns("bin", "obj", "TestResults", "__pycache__"))
        print("Building a disposable copy: dotnet build Preflight.slnx")
        build = run(["dotnet", "build", "Preflight.slnx", "--disable-build-servers", "-v", "q", "-nologo"], copy)
        if build.returncode != 0:
            print(build.stdout + build.stderr)
            print("FAIL build: the current source does not compile (fix the first error above).")
            return 1

        failed_cases = 0
        for fixture, mode, measurement, wanted in CASES:
            label = f"{fixture}.json {mode} {measurement}"
            proc = run(["dotnet", "run", "--project", "ConsoleApp/ConsoleApp.csproj", "--no-build", "--",
                        f"fixtures/{fixture}.json", mode, measurement], copy)
            lines = [line.rstrip() for line in proc.stdout.splitlines()]
            problems = []
            if proc.returncode != 0 or f"PASS {fixture}" not in lines:
                problems.append(f"rule comparison or run failed (exit {proc.returncode})")
                err = proc.stderr.strip().splitlines()
                if err:
                    problems.append("stderr: " + err[0])
            for line in wanted:
                if line in lines:
                    continue
                prefix = line.split(":")[0] + ":"
                found = [l for l in lines if l.startswith(prefix)]
                problems.append(f"expected '{line}' but printed '{found[0]}'" if found else f"missing line '{line}'")
            if problems:
                failed_cases += 1
                print(f"FAIL {label}")
                for p in problems:
                    print("    " + p)
            else:
                print(f"PASS {label}")

        print()
        if failed_cases:
            print(f"Typed report check: FAILED ({failed_cases} of {len(CASES)} cases)")
            return 1
        print(f"Typed report check: PASSED ({len(CASES)} cases)")
        return 0
    finally:
        shutil.rmtree(work, ignore_errors=True)


if __name__ == "__main__":
    sys.exit(main())

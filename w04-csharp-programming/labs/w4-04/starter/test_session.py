"""W4.04 session checker (supplied - leave unchanged).

    python3 test_session.py --fixed-only   # the ten fixed cases (98 assertions) against current source
    python3 test_session.py                # fixed cases, your learner-sequences.json (28 more), then
                                           # two compiler probes of external assignment

Works on a disposable copy, so your working tree keeps no build output.
The compiler probes EXPECT a failed compile: CS0272 (private setter) or CS0200 (get-only property)
naming the property. Those expected compiler failures are internal checks; this script exits 0 only
when the behaviour cases AND both access boundaries pass.
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
PROBE = """// Compiler probe: ordinary caller code assigning {prop} directly.
var session = new GameSession(6);
session.{prop} = -9;
Console.WriteLine(session.{prop});
"""


def run(cmd, cwd):
    return subprocess.run(cmd, cwd=cwd, env=ENV, capture_output=True, text=True)


def validate(path):
    data = json.loads(path.read_text(encoding="utf-8"))
    cases = data["cases"]
    problems = []
    if len(cases) != 2 or any(len(c["steps"]) != 2 for c in cases):
        return ["learner-sequences.json needs exactly two cases with two steps each"]
    first, second = cases
    if any(c["initialMoves"] != 6 for c in cases):
        problems.append("keep initialMoves 6 for both cases")
    if [s["op"] for s in first["steps"]] != ["reserve", "spend"]:
        problems.append("S01 must be reserve then spend")
    if [s["op"] for s in second["steps"]] != ["spend", "reserve"]:
        problems.append("S02 must be spend then reserve")
    if problems:
        return problems
    reserve, spend = first["steps"][0]["amount"], first["steps"][1]["amount"]
    if (second["steps"][1]["amount"], second["steps"][0]["amount"]) != (reserve, spend):
        problems.append("use exactly the same two amounts in both orders")
    if not (0 < reserve <= 6):
        problems.append(f"the reserve amount must be positive and legal alone from 6 (got {reserve})")
    if not (0 < spend <= 6):
        problems.append(f"the spend amount must be positive and legal alone from 6 (got {spend})")
    if reserve + spend <= 6:
        problems.append(f"the combined demand {reserve} + {spend} must exceed 6")
    return problems


def runner(copy, cases_file):
    proc = run(["dotnet", "run", "--project", "Session.csproj", "--no-build", "--", cases_file], copy)
    lines = proc.stdout.rstrip().splitlines()
    for line in lines:
        if line.startswith("    ok  "):
            continue  # print failures and headings only, to keep the output readable
        print(line)
    return proc.returncode == 0


def probe(copy, prop):
    (copy / "Program.cs").write_text(PROBE.format(prop=prop), encoding="utf-8")
    proc = run(["dotnet", "build", "Session.csproj", "--disable-build-servers", "-nologo"], copy)
    out = proc.stdout + proc.stderr
    codes = [code for code in ("CS0272", "CS0200") if code in out and prop in out]
    if proc.returncode != 0 and codes:
        line = next(l for l in out.splitlines() if codes[0] in l)
        print(f"PASS external write to {prop} rejected: {line.split('error ')[-1].split(' [')[0].strip()}")
        return True
    if proc.returncode == 0:
        print(f"FAIL external write to {prop} COMPILED: callers can assign it directly")
    else:
        print(f"FAIL external write to {prop} failed for another reason (expected CS0272 or CS0200):")
        print("    " + next((l for l in out.splitlines() if "error" in l), "no error line"))
    return False


def main(argv):
    fixed_only = "--fixed-only" in argv
    work = Path(tempfile.mkdtemp(prefix="w4-04-check-"))
    copy = work / "starter"
    try:
        shutil.copytree(HERE, copy, ignore=shutil.ignore_patterns("bin", "obj", "__pycache__"))
        build = run(["dotnet", "build", "Session.csproj", "--disable-build-servers", "-v", "q", "-nologo"], copy)
        if build.returncode != 0:
            print(build.stdout + build.stderr)
            print("FAIL build: the current source does not compile.")
            return 1
        print("== Fixed cases: fixtures/session-cases.json")
        ok = runner(copy, "fixtures/session-cases.json")
        if fixed_only:
            return 0 if ok else 1

        print("\n== Your sequences: fixtures/learner-sequences.json")
        problems = validate(copy / "fixtures" / "learner-sequences.json")
        if problems:
            for p in problems:
                print("INVALID " + p)
            ok = False
        else:
            print("Selected requests satisfy the conflict constraints.")
            ok = runner(copy, "fixtures/learner-sequences.json") and ok

        print("\n== Caller boundary: compile external assignments")
        ok = probe(copy, "MovesRemaining") and ok
        ok = probe(copy, "ReservedMoves") and ok
        print("\nSession check: " + ("PASSED" if ok else "FAILED"))
        return 0 if ok else 1
    finally:
        shutil.rmtree(work, ignore_errors=True)


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))

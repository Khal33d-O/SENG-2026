#!/usr/bin/env python3
"""Compare the C# and TypeScript rule engines against independently authored fixtures.

Usage (from the folder that contains compare.py):
    python3 compare.py                      # every fixtures/*.json except board-*.json
    python3 compare.py fixtures/F02.json    # selected fixtures only
    python3 compare.py --ts-dist            # use typescript/dist/runner.js (after `npm run build`)

For each fixture both implementations print one line of JSON. The script parses those lines and
compares each parsed object with the fixture's "expected" object (property order is irrelevant).
Agreement between C# and TypeScript is not enough: both must equal the independent expectation.
Exit code: 0 when every fixture passes, 1 otherwise (so a release check stops).
"""
import json
import os
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
CONSOLE = HERE / "ConsoleApp" / "ConsoleApp.csproj"
ENV = dict(os.environ, DOTNET_NOLOGO="1", DOTNET_CLI_TELEMETRY_OPTOUT="1",
           DOTNET_SKIP_FIRST_TIME_EXPERIENCE="1")


def first_json_line(text):
    """Return the parsed first output line, or an error string if it is not JSON."""
    lines = text.strip().splitlines()
    if not lines:
        return None, "no output"
    try:
        return json.loads(lines[0]), None
    except json.JSONDecodeError:
        return None, f"first line is not JSON: {lines[0][:80]!r}"


def run(cmd):
    proc = subprocess.run(cmd, cwd=HERE, capture_output=True, text=True, env=ENV)
    value, error = first_json_line(proc.stdout)
    if error and proc.returncode != 0:
        tail = (proc.stderr or proc.stdout).strip().splitlines()
        error = f"exit {proc.returncode}: " + (tail[0] if tail else error)
    return value, error


def flatten(value, prefix=""):
    """{'state': {'position': {'x': 1}}} -> {'state.position.x': 1} for field-level messages."""
    if isinstance(value, dict):
        out = {}
        for key, item in value.items():
            out.update(flatten(item, f"{prefix}.{key}" if prefix else key))
        return out
    return {prefix: value}


MISSING = object()


def show(value):
    return "(missing)" if value is MISSING else json.dumps(value)


def field_report(expected, ts, cs):
    """One line per differing field: expected, TypeScript and C# values side by side."""
    exp = flatten(expected)
    tsf = flatten(ts) if isinstance(ts, dict) else {"(whole result)": ts}
    csf = flatten(cs) if isinstance(cs, dict) else {"(whole result)": cs}
    lines = []
    for key in sorted(set(exp) | set(tsf) | set(csf)):
        e, t, c = exp.get(key, MISSING), tsf.get(key, MISSING), csf.get(key, MISSING)
        if not (e == t == c):
            lines.append(f"{key}: expected={show(e)} typescript={show(t)} csharp={show(c)}")
    return lines


def main(argv):
    use_dist = "--ts-dist" in argv
    paths = [a for a in argv if not a.startswith("--")]
    if paths:
        fixtures = [Path(p) for p in paths]
    else:
        fixtures = sorted(p.relative_to(HERE) for p in (HERE / "fixtures").glob("*.json")
                          if not p.name.startswith("board-"))
    if not fixtures:
        print("No fixtures found.")
        return 1

    ts_runner = ["node", "typescript/dist/runner.js"] if use_dist else ["node", "typescript/src/runner.ts"]

    # Build once, then run the built console for each fixture (--no-build keeps runs quick).
    build = subprocess.run(["dotnet", "build", str(CONSOLE), "--nologo", "-v", "q"],
                           cwd=HERE, capture_output=True, text=True, env=ENV)
    if build.returncode != 0:
        print(build.stdout[-2000:])
        print("C# build failed; nothing compared.")
        return 1

    failed = 0
    for fixture in fixtures:
        data = json.loads((HERE / fixture).read_text(encoding="utf-8"))
        expected = data["expected"]
        cs, cs_err = run(["dotnet", "run", "--no-build", "--project", str(CONSOLE), "--", fixture.as_posix()])
        ts, ts_err = run(ts_runner + [fixture.as_posix()])
        problems = [f"{name}: {error}" for name, error in (("C#", cs_err), ("TypeScript", ts_err)) if error]
        if not problems and (cs != expected or ts != expected):
            problems = field_report(expected, ts, cs)
        if problems:
            failed += 1
            print(f"FAIL {data.get('id', fixture.stem)}  {data.get('description', '')}")
            for p in problems:
                print(f"     {p}")
        else:
            print(f"PASS {data.get('id', fixture.stem)}  {data.get('description', '')}")

    total = len(fixtures)
    print(f"{total - failed}/{total} fixtures: C# and TypeScript both match the expected result"
          if not failed else f"{failed} of {total} fixture(s) failed")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))

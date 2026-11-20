#!/usr/bin/env python3
"""Prepare a runnable Week 5 session-API work copy (W5.01-W5.05).

    python3 learner/units/w05-dotnet-application-development/assets/session-api/prepare.py 01 /tmp/academy-w5-01
    python3 .../prepare.py checkpoint /tmp/academy-w5-demo     # complete demo/recovery checkpoint

NN copies the session starter (labs/w5-NN/starter: the shared checkpoint with that session's owned code
left incomplete). "checkpoint" copies the complete checkpoint used for demos and recovery.
The command refuses to overwrite an existing destination, so earlier work and evidence are preserved.
"""
import os
import shutil
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
UNIT = os.path.dirname(os.path.dirname(HERE))  # .../units/w05-dotnet-application-development
SESSIONS = ("01", "02", "03", "04", "05")
IGNORE = shutil.ignore_patterns("bin", "obj", "*.db", "*.db-shm", "*.db-wal", "__pycache__")


def main(argv):
    if len(argv) != 3 or argv[1] not in SESSIONS + ("checkpoint", "demo"):
        print(__doc__)
        print("usage: prepare.py 01|02|03|04|05|checkpoint DESTINATION")
        return 2
    which, dest = argv[1], os.path.abspath(argv[2])
    if os.path.exists(dest) and (not os.path.isdir(dest) or os.listdir(dest)):
        print(f"Refusing to overwrite {dest}: choose a new destination (your earlier work is preserved).")
        return 1
    if which in ("checkpoint", "demo"):
        source = os.path.join(HERE, "checkpoint")
        label = "complete checkpoint (demo/recovery reference)"
    else:
        source = os.path.join(UNIT, "labs", f"w5-{which}", "starter")
        label = f"W5.{which} starter"
    if not os.path.isdir(source):
        print(f"Package incomplete: {source} is missing. Ask the facilitator to restore the pack.")
        return 1
    if os.path.isdir(dest):
        os.rmdir(dest)
    shutil.copytree(source, dest, ignore=IGNORE)
    print(f"Prepared {label} in {dest}")
    print("Next:")
    print(f"  cd {dest}")
    print("  dotnet restore Api/Api.csproj")
    print("  dotnet build Api/Api.csproj --no-restore")
    print("  STORE=memory dotnet run --no-build --project Api -- --urls http://127.0.0.1:5055")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))

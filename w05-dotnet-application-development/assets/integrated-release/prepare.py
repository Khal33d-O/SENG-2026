#!/usr/bin/env python3
"""Prepare a Week 5 integrated-release source copy (W5.06-W5.10, P5).

    python3 "$W5_PACKAGE/prepare.py" 06 "$W5_ATTEMPT/owned"     # Tests/Program.cs rejected-flow scope incomplete
    python3 "$W5_PACKAGE/prepare.py" 07 "$W5_ATTEMPT/owned"     # Api/Program.cs action tags/log incomplete
    python3 "$W5_PACKAGE/prepare.py" 10 "$W5_ATTEMPT/project"   # complete integrated checkpoint for P5

Sessions with an owned code scope copy labs/w5-NN/starter; the others copy the package's complete
source. The command refuses to overwrite an existing destination.
"""
import os
import shutil
import sys

sys.dont_write_bytecode = True  # keep the package folder free of __pycache__
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import w5lib as w  # noqa: E402

SESSIONS = ("06", "07", "08", "09", "10")


def main(argv):
    if len(argv) != 3 or argv[1] not in SESSIONS:
        print(__doc__)
        return 2
    session, dest = argv[1], os.path.abspath(argv[2])
    if os.path.exists(dest) and (not os.path.isdir(dest) or os.listdir(dest)):
        print(f"Refusing to overwrite {dest}: choose a new destination (earlier evidence is preserved).")
        return 1
    starter = os.path.join(w.UNIT, "labs", f"w5-{session}", "starter")
    source = starter if os.path.isfile(os.path.join(starter, "Academy.slnx")) else w.SOURCE
    if os.path.isdir(dest):
        os.rmdir(dest)
    shutil.copytree(source, dest, ignore=w.IGNORE)
    kind = "owned starter" if source == starter else "complete integrated checkpoint"
    print(f"Prepared W5.{session} {kind} in {dest}")
    print(f'Run: python3 "$W5_PACKAGE/run.py" test --source "{dest}" --workspace <new path>')
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))

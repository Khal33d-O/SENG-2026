#!/usr/bin/env python3
"""SUPPLIED recovery (run from starter):  python3 tools/recover.py

1. Requires plan.json, src/acceptance.ts and ../document/template.md. If any is missing it stops BEFORE
   overwriting anything.
2. Copies all three into a NEW attempt directory ../attempts/attempt-<UTC time>[-n] (earlier attempts kept).
3. Only then copies the syntax checkpoint ../checkpoint/acceptance.ts into src/acceptance.ts.
The checkpoint supplies the invalid-example syntax floor; it leaves the completion witness and the plan
choice unresolved.
"""
import datetime
import os
import shutil
import sys

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # starter/
LAB = os.path.dirname(HERE)
REQUIRED = {
    "plan.json": os.path.join(HERE, "plan.json"),
    "acceptance.ts": os.path.join(HERE, "src", "acceptance.ts"),
    "template.md": os.path.join(LAB, "document", "template.md"),
}
CHECKPOINT = os.path.join(LAB, "checkpoint", "acceptance.ts")


def main():
    missing = [name for name, path in REQUIRED.items() if not os.path.isfile(path)]
    if not os.path.isfile(CHECKPOINT):
        missing.append("../checkpoint/acceptance.ts")
    if missing:
        print("STOPPED before overwrite; missing: " + ", ".join(missing))
        return 1
    stamp = datetime.datetime.now(datetime.timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    target = os.path.join(LAB, "attempts", f"attempt-{stamp}")
    n = 1
    while os.path.exists(target):
        n += 1
        target = os.path.join(LAB, "attempts", f"attempt-{stamp}-{n}")
    os.makedirs(target)
    for name, path in REQUIRED.items():
        shutil.copy2(path, os.path.join(target, name))
    print(f"PRESERVED {target} (plan.json, acceptance.ts, template.md)")
    shutil.copy2(CHECKPOINT, REQUIRED["acceptance.ts"])
    print("CHECKPOINT src/acceptance.ts now holds the syntax floor. Completion witness and plan choice remain yours.")
    print("Next: npm run build && npm run plan, then compare with your preserved attempt.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

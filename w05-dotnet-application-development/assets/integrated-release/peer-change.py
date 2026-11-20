#!/usr/bin/env python3
"""Generate the simulated peer change used when no second author is available (W5.08, W5.09).

    python3 "$W5_PACKAGE/peer-change.py" "$W5_ATTEMPT/release/source"                   # W5.08 review fixture
    python3 "$W5_PACKAGE/peer-change.py" "$W5_ATTEMPT/release/source" --candidate-only  # W5.09 candidate

The full change edits two files and leaves them uncommitted for review:
  Api/Program.cs  release label "known-good" -> "candidate"
  Api/Routes.cs   the rejected-action status 409 -> 200 (a contract violation the review should catch)
--candidate-only changes only the release label (schema-compatible candidate).
Label any review of this fixture as a SIMULATED peer review.
"""
import os
import sys

LABEL_OLD = 'const string Release = "known-good";'
LABEL_NEW = 'const string Release = "candidate";'
STATUS_OLD = 'if (!result.Accepted) return Error(context, 409, result.Reason!, "Move rejected; confirmed state is unchanged.");'
STATUS_NEW = 'if (!result.Accepted) return Error(context, 200, result.Reason!, "Move rejected; confirmed state is unchanged.");'


def edit(path, old, new):
    with open(path, encoding="utf-8") as fh:
        text = fh.read()
    if new in text:
        print(f"already changed: {path}")
        return
    if old not in text:
        raise SystemExit(f"Cannot apply the peer change: expected line not found in {path}")
    with open(path, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(text.replace(old, new, 1))
    print(f"changed: {os.path.relpath(path)}")


def main(argv):
    args = [a for a in argv[1:] if not a.startswith("--")]
    if len(args) != 1:
        print(__doc__)
        return 2
    source = os.path.abspath(args[0])
    edit(os.path.join(source, "Api", "Program.cs"), LABEL_OLD, LABEL_NEW)
    if "--candidate-only" not in argv:
        edit(os.path.join(source, "Api", "Routes.cs"), STATUS_OLD, STATUS_NEW)
    print("Simulated peer change applied (uncommitted). Inspect it with git diff before testing.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))

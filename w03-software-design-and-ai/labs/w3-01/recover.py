"""W3.01 recovery. Run from this lab directory:  python3 recover.py   (Windows: python recover.py)

Requires both starter.mmd and notes.md. Preserves them in a NEW attempt directory (attempts/attempt-N),
verifies the copies, then replaces ONLY the diagram with the partial syntax checkpoint. Repeating recovery
creates another distinct backup. A missing artifact stops recovery before anything is overwritten.
"""
import filecmp, os, shutil, sys

LAB = os.path.dirname(os.path.abspath(__file__))
ARTIFACTS = ["starter.mmd", "notes.md"]
CHECKPOINT = os.path.join(LAB, "checkpoint", "partial-syntax.mmd")


def main():
    missing = [a for a in ARTIFACTS if not os.path.exists(os.path.join(LAB, a))]
    if missing:
        sys.exit(f"recovery stopped before overwrite: missing {', '.join(missing)}")
    n = 1
    while os.path.exists(os.path.join(LAB, "attempts", f"attempt-{n}")):
        n += 1
    backup = os.path.join(LAB, "attempts", f"attempt-{n}")
    os.makedirs(backup)
    for a in ARTIFACTS:
        shutil.copy2(os.path.join(LAB, a), os.path.join(backup, a))
        if not filecmp.cmp(os.path.join(LAB, a), os.path.join(backup, a), shallow=False):
            sys.exit(f"backup verification failed for {a}; nothing replaced")
    shutil.copy(CHECKPOINT, os.path.join(LAB, "starter.mmd"))
    print(f"backed up starter.mmd and notes.md to {backup}")
    print("restored starter.mmd from the partial syntax checkpoint; notes.md left unchanged")
    print("complete the relationships from your preserved attempt - the checkpoint does not choose the design")


if __name__ == "__main__":
    main()

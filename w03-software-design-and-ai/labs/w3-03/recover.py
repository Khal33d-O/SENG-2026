"""W3.03 recovery. Run from this lab directory:  python3 recover.py   (Windows: python recover.py)

Preserves the two owned files (starter/src/rules.ts, starter/tests/claim.test.mjs) in a NEW sibling
attempt directory beside the lab, verifies the copies byte for byte, then restores ONLY the pre-fix rule.
Your authored claims stay in place. Refuses to replace anything if a required file is missing.
"""
import filecmp, os, shutil, sys

LAB = os.path.dirname(os.path.abspath(__file__))
OWNED = [os.path.join("starter", "src", "rules.ts"), os.path.join("starter", "tests", "claim.test.mjs")]
CHECKPOINT = os.path.join(LAB, "recovery", "rules.pre-fix.ts")


def main():
    missing = [p for p in OWNED if not os.path.exists(os.path.join(LAB, p))]
    if missing or not os.path.exists(CHECKPOINT):
        sys.exit(f"recovery stopped before replacement; missing: {missing or [CHECKPOINT]}")
    parent, name = os.path.split(LAB)
    n = 1
    while os.path.exists(os.path.join(parent, f"{name}-attempt-{n}")):
        n += 1
    backup = os.path.join(parent, f"{name}-attempt-{n}")
    for rel in OWNED:
        target = os.path.join(backup, rel)
        os.makedirs(os.path.dirname(target), exist_ok=True)
        shutil.copy2(os.path.join(LAB, rel), target)
        if not filecmp.cmp(os.path.join(LAB, rel), target, shallow=False):
            sys.exit(f"backup verification failed for {rel}; nothing restored")
    shutil.copy(CHECKPOINT, os.path.join(LAB, OWNED[0]))
    print(f"backup verified: {backup}")
    for rel in OWNED:
        print(f"  {os.path.join(backup, rel)}")
    print("restored starter/src/rules.ts to the pre-fix rule; tests/claim.test.mjs left in place")


if __name__ == "__main__":
    main()

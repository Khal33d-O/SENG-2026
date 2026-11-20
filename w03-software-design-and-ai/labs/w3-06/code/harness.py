"""W3.06 harness (`make test` from the lab root, or `python3 code/harness.py`).

Compiles four fresh temporary stages and runs YOUR check (starter/tests/ownership.test.mjs) in each:

  current          supplied session + existing correction           -> your check should PASS
  valid-refactor   supplied session + reviewed rule refactor        -> should PASS
  lost-state       session discards the rule's returned state       -> should FAIL by assertion
  shared-state     live sessions share one module-level state       -> should FAIL by assertion

A compiler/import error does not count as detection. Exit status 0 only when all four behave as expected.
"""
import os, re, sys
if hasattr(sys.stdout, "reconfigure"):  # Windows consoles: print test-runner symbols safely
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from stagekit import run_stage, summary

STAGES = [
    ("current", {}, True),
    ("valid-refactor", {"src/rules.ts": "rules.refactor.ts"}, True),
    ("lost-state", {"src/session.ts": "session.lost-state.ts"}, False),
    ("shared-state", {"src/session.ts": "session.shared-state.ts"}, False),
]
TEST = ["tests/ownership.test.mjs"]


def main():
    ok = True
    for label, overrides, should_pass in STAGES:
        code, out = run_stage(label, overrides, TEST)
        tests = re.search(r"ℹ tests (\d+)", out)
        skipped = re.search(r"ℹ (skipped|todo) ([1-9]\d*)", out)
        assertion = "AssertionError" in out or "ERR_ASSERTION" in out or "Expected values" in out
        if "COMPILE ERROR" in out:
            verdict = "SETUP FAILURE (compile) - not detection"
        elif tests is None or tests.group(1) != "1" or skipped:
            verdict = "INVALID: keep exactly one unskipped integration test"
        elif should_pass:
            verdict = "accepted as expected" if code == 0 else "UNEXPECTED FAILURE of a valid implementation"
        else:
            verdict = ("detected by assertion" if code != 0 and assertion
                       else "NOT DETECTED (check passed)" if code == 0 else "FAILED WITHOUT AN ASSERTION - not detection")
        good = verdict in ("accepted as expected", "detected by assertion")
        ok &= good
        print(f"{'ok ' if good else 'BAD'} {label:15} expected {'pass' if should_pass else 'fail':4}  -> {verdict}")
        print(summary(out))
    print("PASS: your check accepts both valid stages and detects both broken collaborators" if ok
          else "FAIL: see the stage results above (an intentional starter assert.fail fails every stage)")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())

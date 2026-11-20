"""W3.06 worked example 1 (`python3 code/demo.py` from the lab root).

Compiles three temporary stages - known red (baseline defect), green (existing correction) and the reviewed
refactor - and runs both the direct rule check and the single-session integration check
(starter/tests/session.test.mjs) in each. The baseline is EXPECTED to fail the five-move expectation.
No service account or model call is involved; only the save response is controlled.
"""
import os, sys
if hasattr(sys.stdout, "reconfigure"):  # Windows consoles: print test-runner symbols safely
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from stagekit import run_stage, summary

STAGES = [("red (known baseline)", {"src/rules.ts": "rules.baseline.ts"}),
          ("green (existing correction)", {}),
          ("refactor (reviewed)", {"src/rules.ts": "rules.refactor.ts"})]


def main():
    for label, overrides in STAGES:
        code, out = run_stage(label.split()[0], overrides, ["tests/session.test.mjs"])
        print(f"== {label}: exit {code}")
        print(summary(out))
    print("Expected: red fails the five-move expectation (direct and integration); green and refactor pass.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

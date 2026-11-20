# Review brief

| Item | Value |
|---|---|
| Patch identifier | **Candidate C** (`packet/candidate-C.diff`) |
| Baseline | Known-defective Week 3 rule (`packet/source-context.md`): a rejected action spends one move |
| Request (the requested change) | **A rejected action preserves the state.** |
| Promises that remain in force | An accepted action still costs one move, including an action that collects treasure. Collection still records the identifier once and adds ten points once. Status still follows the resulting legal state and remaining budget. The board and legal coordinates are unchanged. |
| Authority for expectations | This request and the board rules (`board.ts`), not the candidate's arithmetic or its message |
| Evidence packet | `packet/source-context.md`, `packet/candidate-C.diff`, `packet/candidate-message.md`, `packet/trace-observations.md`, `packet/quality-report.md`, `packet/demonstration-packet.md` |
| Deliverable | One completed Markdown review (`review-template.md` → your copy) with a verdict |

Board facts: 3 × 3 (coordinates 0–2), start (0,0), wall (1,1), treasure t1 at (2,0) worth 10, exit (2,2), six
moves. Winning on the exit with t1 is checked before the zero-budget loss.

The trace observations are actual local executions of the supplied programs. You may request a replay of
another complete sequence from the instructor; state the starting state and all actions, and label your
expected outcome as a prediction until it is replayed.

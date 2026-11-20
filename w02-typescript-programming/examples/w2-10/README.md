# W2.10 worked examples and captured traces

Both worked examples run inside the lab starter (`../../labs/w2-10/starter`):

| Worked example | How to run it |
|---|---|
| **Worked Example 1: check the reference start and action** (continued: progress and finish) | `npm test` (twelve rule checks + five acceptance examples), then `python3 tools/serve.py` and open the URL with `?plan=B`: East, South (wall), East, South, South -> won at (2,2), score 10, two moves |
| **Worked Example 2: map a target range** | `node --test tests/range.test.mjs`; in the Target range panel: Hit, Miss, Hit |

Captured material for a blocked environment (label it as captured, not your execution):

| File | Contents |
|---|---|
| [`plan-A-trace.txt`](plan-A-trace.txt) | `npm run plan` with proposal A (panel-record): the shown state collects t1, the retained state does not, so the exit does not win |
| [`plan-B-trace.txt`](plan-B-trace.txt) | `npm run plan` with proposal B (session-record): completion passes |
| [`demo-observations.md`](demo-observations.md) | Browser walkthrough of both worked examples |
| `emitted/plans.js`, `emitted/session.js` | Captured `./dist/plans.js` and `./dist/session.js` (what Hint 3 imports) |

The completion and invalid-action sequences in these traces are the reference answers; use them only after
your own prediction.

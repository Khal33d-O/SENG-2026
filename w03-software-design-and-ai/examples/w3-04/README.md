# W3.04 worked examples

Run from `../../labs/w3-04/code` after `npm ci --ignore-scripts --no-audit --no-fund` in `code/starter`.

- **Worked example 1** — `python3 assist.py prepare --prompt ../document/demo-task.txt`, then `inspect`, `check` (two of five fail), `run` (replays the recorded demonstration run; no model call), `inspect`, `check` (five pass).
- **Worked example 2** — `python3 demo.py unsupported` (fails on accepted-move cost) and `python3 demo.py corrected` (passes all five).
- Recorded runs: `code/recorded/demo-run.json` and `code/recorded/preflight-run.json` (teaching records).

No live model, API key or account is used by any example.

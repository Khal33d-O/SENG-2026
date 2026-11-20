# W3.04 code instructions

Run everything from this `code` directory. Use `python3` (macOS/Linux) or `python` / `py -3` (Windows).

```bash
cd starter && npm ci --ignore-scripts --no-audit --no-fund && npm test && cd ..   # 5 tests, 2 fail initially
W304_ATTEMPT=$(python3 assist.py prepare --prompt ../document/task.txt)          # prints attempts/<id>/record.json
python3 assist.py inspect "$W304_ATTEMPT"     # instruction, prepared permissions, events, diff, scope, checks
python3 assist.py check "$W304_ATTEMPT"       # fresh copy; records rule/test SHA-256 and changed files
python3 assist.py run "$W304_ATTEMPT"         # ONE run: --mode recorded (default) | manual | external
python3 assist.py check "$W304_ATTEMPT"
python3 assist.py recover "$W304_ATTEMPT"     # verified backup of rule + instruction, then original rule restored
python3 demo.py unsupported                   # worked example 2: fails on accepted-move cost
python3 demo.py corrected                     # passes all five
```

PowerShell equivalents: `$env:W304_ATTEMPT = python assist.py prepare --prompt ../document/task.txt`, then
`python assist.py inspect "$env:W304_ATTEMPT"` and so on.

## Attempt directory

| File | Answers |
|---|---|
| `instruction.txt` | What was the tool asked to do? |
| `original/rules.ts` | The rule before the run |
| `permissions.json` | Prepared exact-path controls (three reads, one edit; shell, web, delegation denied) |
| `workspace/` | The only copy the run may change; edit `workspace/src/rules.ts` for `--mode manual` |
| `events.jsonl`, `record.json` → `run` | What did the tool (or person) actually do, and its process status? |
| `record.json` → `checks`, `checks/check-N.txt` | What did each independent check execute (fingerprints) and what was the result? |
| `recovery-N/` | Verified backups made by `recover` |

`permissions.json` follows the version-1 layout of the course's prepared terminal agent (singular
`permission`, ordered rules); version-2 documentation uses a different structure. It is generated for
inspection and for a facilitator-run tool; `assist.py` itself never executes a tool or model.

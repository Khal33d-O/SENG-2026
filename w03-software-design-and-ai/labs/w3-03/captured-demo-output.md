# Captured demonstration output (for use when execution is blocked)

Captured by the course author on 2026-10-11 (Node 24.10 on Windows; the course pin is Node 22.23.2) in a
fresh copy of `starter/` after `npm ci`. Your own run is the evidence; this capture is support only.

`npm run demo:red` (exit 1) — the assertion that fails is the state-preservation one:

```text
✖ wall rejection preserves the caller's state (demo-red)
  + actual - expected
  +   movesRemaining: 4,
  -   movesRemaining: 5,
```

`npm run demo:green` → `ℹ pass 1`, `ℹ fail 0`. `node regression.mjs demo-green`:

```text
PASS accepted movement to the exit
PASS repeated wall rejection
PASS rejection after completion
PASS out-of-bounds rejection before progress
All 4 regression sequences pass (demo-green)
```

`node regression.mjs` against the unchanged pre-fix `rules` reports `2 of 4 regression sequences failed (rules)`.

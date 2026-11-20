# Demonstration note: single-session collaboration (complete example)

**Contract.** A loaded session retains an accepted move and preserves its public state after a rejected
wall action: from the initial save (0,0, six moves), East gives (1,0) with five moves in the session snapshot;
South into the wall (1,1) is rejected and the snapshot still shows (1,0) with five moves.

**Boundary.** Real: `openSession`, `decodeSave`, the session's `move`/`snapshot`, `evaluateMove`. Controlled:
the external save service, replaced by `controlledResponses(START)`, which returns synthetic JSON and records
the requested slot (`slot-1`) and body reads.

**Setup.** One fresh factory per save; each test awaits `openSession`. Each stage is compiled in a fresh
temporary directory and run in its own process.

**Verification.** `python3 code/demo.py` from the lab root (recorded on 2026-10-11):

| Stage | Command result | Observation |
|---|---|---|
| red (known baseline rule) | exit 1; 0 pass, 2 fail | direct and integration checks report `movesRemaining` 4, expected 5 |
| green (existing correction) | exit 0; 2 pass | session snapshot (1,0), five moves, after the rejected South |
| refactor (reviewed) | exit 0; 2 pass | same observations |

**Limits.** This example checks one session at a time in one process with a controlled response. It does not
show that two sessions alive together keep separate state, that a live save service behaves the same, or that
other game rules hold.

**Next question.** Do two simultaneously live sessions keep their own state when one is opened or advanced?

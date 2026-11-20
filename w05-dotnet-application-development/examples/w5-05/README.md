# W5.05 worked examples · Asynchronous persistence and consistent updates

| Script | Demonstration | Expected |
|---|---|---|
| [demo1.sh](demo1.sh) | Demos 1–2 with the complete checkpoint (SQLite, `TRAINING_FAILURES=1`) | `PASS failed save retains every state field; later East succeeds` |
| [demo2.sh](demo2.sh) | Demo 2 · the starter without the outer transaction, then repaired | before: `FAIL failure: failed save retained candidate state` (row moved to (2,0) despite `500`); after: `PASS` |

```bash
python3 check.py --case failure
```

In the browser (Demo 1/2 by hand): New game, East, South → F02 then `409 ILLEGAL_ACTION`; tick
Fail next save and click East → `500 SAVE_FAILED` with a request ID while position stays (1,0), score
0, moves 5, no collected IDs; Load session agrees. Then a normal East → (2,0), score 10, moves 4,
collected `["t1"]`. No automatic retry appears in Network.

Offline trace: before F02; attempted East writes candidate F02+treasure; injected exception before
commit → `500`; disposal rolls back; GET remains F02. In the broken starter GET has moved despite
`500`, so the check fails.

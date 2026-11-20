# W5.03 worked examples · Validated actions from browser to API

| Script | Demonstration | Expected |
|---|---|---|
| [demo1.sh](demo1.sh) | Demo 1 · Implement the action boundary | before: East `501 EXERCISE_INCOMPLETE`; after: `PASS action: East 200/F02, South 409 ILLEGAL_ACTION, malformed 400, missing 404` |

Demo 2 · Connect and inspect the browser is done by hand: with the repaired copy running in memory
mode, open `http://127.0.0.1:5055`, open the Network panel, choose New game, East, then South.
Expect `(1,0)`, five moves and score 0 after East; South displays `ILLEGAL_ACTION` and a request ID;
every displayed state field remains unchanged. Choose Load session and compare again. The request body
is `{"type":"move","direction":"south"}` only.

```bash
python3 check.py --case action
```

Offline trace: east → `200`, (1,0), moves 5; south → `409 ILLEGAL_ACTION`; subsequent GET returns
exactly the East envelope. A missing direction is `400`, not the wall's `409`.

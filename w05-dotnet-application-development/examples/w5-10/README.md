# W5.10 worked examples · Release acceptance and handover

[demo.sh](demo.sh) runs the three rehearsals.

```bash
python3 "$W5_PACKAGE/run.py" rehearse --workspace "$W5_ATTEMPT/normal" --hint-mode success
```

Expected: `PASS HTTP integration tests`; `ok hint: source is model (mode success)`; `ok hint: direction is
permitted from stored (1,0): east (forged (2,1) would give north)`; `ok hint: hint did not change stored
state`; browser lines from Chromium (New game (0,0); East (1,0), five moves; South `ILLEGAL_ACTION` with a
request ID, display and GET unchanged; hint source; East, South, South won with score 10; GET agrees;
Load session agrees) or `SKIP browser` when Playwright is not installed; `ok restart: GET <id> equals the
last confirmed state`; `PASS rehearsal, hint mode success`.

```bash
python3 "$W5_PACKAGE/run.py" rehearse --workspace "$W5_ATTEMPT/timeout" --hint-mode timeout
python3 "$W5_PACKAGE/run.py" serve --workspace "$W5_ATTEMPT/retained" --hint-mode timeout
```

Timeout rehearsal: `ok hint: source is fallback (mode timeout)` with explanation `Fallback (simulated
model timed out): east is the first permitted direction in N, E, S, W order.` The serve command prints
`Created new database ...` the first time and `Reusing retained database ...` when repeated; load the
original session ID in the browser and compare every field.

Offline trace: East F02; South 409 leaves F02; timeout hint suggests East/fallback but state remains F02;
restart/load same ID returns F02.

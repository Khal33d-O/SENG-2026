# Release rehearsal checklist

| Criterion | Evidence to record | Result / owner / P5 timebox |
|---|---|---|
| Browser completes East, East, South, South; score 10 and won | Session ID, displayed state and independent GET | Fill in |
| Wall, malformed input and completed-session action rejected | Status/code/requestId and unchanged subsequent GET | Fill in |
| Atomic save failure keeps confirmed state | Before/error/after, browser unchanged | Fill in |
| Retained database survives process/image restart | Same session ID and every field before/after | Fill in |
| Hint success, validation and timeout behaviours | Mode, source, permitted action, no game-state mutation | Fill in |
| Hint ignores forged client state | Server-authoritative session and result | Fill in |
| Failed action reaches prepared Grafana view | Request ID, .NET log and data-source record | Fill in |
| Candidate and known-good restore work | Revisions, image IDs, readiness and Service action | Fill in |
| Handover can be followed by another learner | Usage, storage/reset and recovery commands | Fill in |

Commands that produce the evidence (see the lab README): `run.py rehearse` (success, validation,
timeout), `run.py serve` twice on the same workspace, `run.py telemetry`, and the W5.09 `release.py`
sequence.

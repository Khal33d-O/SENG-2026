# W5.07 worked examples · .NET logging and OpenTelemetry

[demo.sh](demo.sh) runs both demonstrations with `--no-wait` (the lab commands keep the view open until
Ctrl+C so you can use the browser and Grafana).

```bash
python3 "$W5_PACKAGE/run.py" telemetry --workspace "$W5_ATTEMPT/demo-view"
```

Expected: `accepted action: 200; injected failure: 500 SAVE_FAILED`, the request ID of the failed action,
`GET after failure` still (1,0) with five moves, then `ok record with this requestId reached the data
source`, `ok status 500`, `ok outcome rejected`, `ok traceId present`, `PASS request-filtered data-source
check`, and a Grafana URL ending `/d/academy-w5-hints?var-request_id=<id>&from=now-15m&to=now`.
Evidence files in the workspace: `api.log`, `action-spans.jsonl`, `grafana-query.json`, `collector.log`.

An exported record looks like this (values differ per run):

```json
{"ts": "...", "job": "academy-w5-actions", "session": "demo-view", "name": "game.action", "spanId": "...", "spanStatus": "Error", "spanDurationMs": 22, "requestId": "req-...", "status": 500, "outcome": "rejected", "traceId": "...", "durationMs": 21}
```

```bash
python3 "$W5_PACKAGE/prepare.py" 07 "$W5_ATTEMPT/owned"
python3 "$W5_PACKAGE/run.py" telemetry --source "$W5_ATTEMPT/owned" --workspace "$W5_ATTEMPT/before-view"
```

Expected: `FAIL record with this requestId reached the data source` (the span only carries
`durationMs`) and `FAIL request-filtered data-source check`.

Offline trace: browser SAVE_FAILED ID demo-17; .NET completion status 500; span requestId demo-17,
outcome rejected, traceId abc...; Grafana exact-ID filter returns that same span. This is a supplied
trace, not your execution evidence.

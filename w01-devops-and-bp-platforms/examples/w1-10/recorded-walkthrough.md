# Recorded walkthrough (historical evidence, 2026-10-10)

Recorded by the course author with the supplied helper (emulated client; Loki 3.7.8; Grafana 13.2.3). Use it for
analysis during recovery only: it does not establish a fresh execution in your environment, and its identifiers must
never be typed into a new run.

| Step | Command (demo workspace) | Observation |
|---|---|---|
| Reference | `browser ... reference --expect received` | PASS: HTTP 200, foundation-observe-a, workshop-blue, 3x3, 6 moves; health 200 Healthy |
| Missing | `browser ... missing --expect http-error` | PASS: HTTP 404 NOT_FOUND; health Healthy |
| Slow (80 ms, 0 retries) | `browser ... slow --expect received` | FAIL as expected: outcome unavailable after 98 ms ([`recorded/last-observation.json`](recorded/last-observation.json)) |
| Query | `query ... last-request` | server row: path /api/boards/slow, result_status 200, elapsed_ms 311, caller_aborted true ([`recorded/matching-record.json`](recorded/matching-record.json)) |
| Grafana | `grafana ... last-request` | datasource response: 1 matching row; dashboard URL saved |
| Backup x2 | `backup ...` twice | two distinct `saved/` directories ([`recorded/backup-manifest.json`](recorded/backup-manifest.json)) |
| Overdue | `browser ... overdue --expect unavailable` (after the learner's chosen change) | PASS: bounded unavailable within the allowance; later server row elapsed_ms 905, caller_aborted true |

The browser's evidence stops when its deadline aborts the attempt; the server's record continues until the handler
finishes, so a server-selected 200 can coexist with no receipt.

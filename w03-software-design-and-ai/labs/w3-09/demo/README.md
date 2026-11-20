# W3.09 complete demonstrations

- `src/instrumentation.ts` — the complete known `recordHint` operation. `make demo` swaps it into a fresh
  temporary copy of `starter/` and runs the 24 response + 5 signal checks (29).
- `python3 launch.py demo` — the local view with the complete operation.

## Labelled prior capture (actual local run, terminal events only — NOT a Grafana capture)

Recorded by the course author on 2026-10-11 with `python launch.py starter` after completing
`recordHint`, on a machine **without** the prepared Loki/Grafana images (the launcher printed
"prepared image ... is not available"). Requests were posted to `http://127.0.0.1:4309/api/hint` from the
initial state with the controls shown. Request IDs and durations differ on every run; use your own.

| Control | Public result | Terminal event (from `runs/<run>/events.jsonl`) |
|---|---|---|
| Seed A, wait 15 ms | fallback east | `{"requestId":"hint-564bc49c","latencyMs":24.259399999999914,"outcome":"timeout","fallback":true}` |
| Seed B, wait 180 ms | fallback east | `{"requestId":"hint-bac11a11","latencyMs":186.14289999999983,"outcome":"validation-failure","fallback":true}` |
| Seed A, wait 0 ms (a repeat) | model east "Explore the open eastern square." | `{"requestId":"hint-aaa41871","latencyMs":0.40530000000035216,"outcome":"model-success","fallback":false}` |

Use this capture only to practise interpretation. It is not evidence of your own run, and it is not
evidence that a collector received or a Grafana query returned these events.

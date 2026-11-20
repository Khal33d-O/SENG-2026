# W1.10 worked examples: browser, API, health and a matching completion record

Instructor demonstration from [`../../labs/w1-10/`](../../labs/w1-10/) with a fresh demo destination (`/tmp/w110-demo`
in the book; any new folder works). Tested 2026-10-10 on Windows with .NET SDK 10.0.102, Podman 5.7.0, Loki 3.7.8 and
Grafana 13.2.3, using the helper's emulated client (Python Playwright was not installed on the authoring machine).

## Worked Example 1: run browser, API and health checks

```bash
python3 starter/run.py prepare /tmp/w110-demo
python3 starter/run.py browser /tmp/w110-demo reference --expect received
```

Expect HTTP 200, release `foundation-observe-a`, environment `workshop-blue`, a three-by-three board and six initial
moves, plus a separate `/healthz` 200 `Healthy`. Independent terminal check (replace the port with your printed one):

```bash
curl --fail-with-body -i http://127.0.0.1:4100/api/boards/reference
```

## Worked Example 2: locate the matching completion record

```bash
python3 starter/run.py query /tmp/w110-demo last-request
python3 starter/run.py grafana /tmp/w110-demo last-request
```

The completion record has the same `request_id`, `GET` reference path, `result_status` 200, blue environment and
`caller_aborted: false`. Open the saved Grafana URL and verify the Request or action ID field and time range.

## Worked Example 3: a received error is still a response

```bash
python3 starter/run.py browser /tmp/w110-demo missing --expect http-error
python3 starter/run.py query /tmp/w110-demo last-request
```

HTTP 404 with `NOT_FOUND`, a distinct request ID and a matching record; health stays Healthy.

## Guided practice: predict a public environment change

Change the workspace `runtime.env` to `LAB_ENV=workshop-green`, then:

```bash
python3 starter/run.py backup /tmp/w110-demo
python3 starter/run.py apply /tmp/w110-demo
python3 starter/run.py browser /tmp/w110-demo reference --expect received --environment workshop-green
```

Then inspect a failed expectation (green response, old blue expectation; nonzero result, health still Healthy):

```bash
python3 starter/run.py browser /tmp/w110-demo reference --expect received --environment workshop-blue
```

## Key takeaways: check the recovery record

```bash
python3 starter/run.py backup /tmp/w110-demo
python3 starter/run.py backup /tmp/w110-demo
```

Two invocations create two distinct `saved/` directories, each with `backup-manifest.json`.

## Recorded walkthrough (historical, labelled)

[`recorded-walkthrough.md`](recorded-walkthrough.md) holds the author's 2026-10-10 run (identifiers are historical;
never type them into a new run).

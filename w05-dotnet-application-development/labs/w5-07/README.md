# W5.07 · Instrument and trace a failed action

**Session:** W5.07 · .NET logging and OpenTelemetry · 120 minutes
**Driving question:** Which log, metric and trace concepts can I reuse from the earlier weeks?

One challenge · 45 minutes owned work inside the 120-minute module.

## Outcomes

* Distinguish a log (one event), a metric (aggregated measurements) and a trace (timed operations).
* Locate where the prepared .NET instrumentation connects to the telemetry path:
  `Telemetry.Start` → `Academy.Game` ActivitySource → JSON exporter → collector bridge → Loki → Grafana.
* Record the additional action evidence: `requestId`, numeric `status`, accepted/rejected `outcome`,
  `traceId` and a structured completion log with a named template.
* Correlate a browser symptom with an API or storage failure through the request ID.

## Supplied and owned

**Owned scope: `Api/Program.cs`: action completion tags and structured log statement.**
ActivitySource, exporter, collector and Grafana plumbing are supplied:
`Api/Telemetry.cs` (TracerProvider with `AlwaysOnSampler`, `CollectorExporter`),
`collector/collector.py` (JSON bridge to Loki push data; explicitly **not** OTLP), `grafana/`
(request-filtered data source and the reused "Hint request evidence" dashboard), `run.py telemetry`.

The starter's action middleware already starts the span:

```csharp
using var action = Telemetry.Actions.StartActivity("game.action");
```

but after `await next(context)` it only tags `durationMs`, so a span can exist without the needed
`requestId` tag and the request-filtered data-source check fails.

## Starting point

Start in the academy repository root in the prepared shell. The book prints the first command wrapped:

```bash
export W5_PACKAGE="$PWD/learner/units/w05-dotnet-application-development/assets/integrated-
    release"
```

Type it as one line:

```bash
export W5_PACKAGE="$PWD/learner/units/w05-dotnet-application-development/assets/integrated-release"
export W5_ATTEMPT="$(mktemp -d)"
```

`run.py telemetry` needs Podman for the local Loki and Grafana containers (it removes only its own
pod). Without Podman it falls back to a **local mock** query that is labelled "NOT Grafana/Loki
evidence"; a local file alone does not demonstrate collector delivery.

## Concepts and syntax

`action?.SetTag("requestId", context.TraceIdentifier)` adds a field if a span exists; `?.` safely
handles a missing listener. Status and outcome are recorded after `await next(context)`, when the inner
exception handler has mapped a failed save to 500. `LogInformation("Game action {RequestId} completed
{Status}", id, status)` preserves named fields; string interpolation loses that queryable template. Do
not log full request bodies, database content or credentials. `requestId` is the HTTP correlation key
and `traceId` identifies the timed span: keep both.

## Worked demonstrations

Scripts: [examples/w5-07](../../examples/w5-07/README.md).

### Demo 1 · follow the complete action telemetry path

```bash
python3 "$W5_PACKAGE/run.py" telemetry --workspace "$W5_ATTEMPT/demo-view"
```

Expect one accepted action and one injected `SAVE_FAILED` 500. Open the printed Grafana URL, enter the
printed requestId in its Request ID textbox and select the last 15 minutes. The reused dashboard title
says "Hint request evidence"; this isolated view now contains the exported action records. Match
requestId/status/traceId to `api.log` and `action-spans.jsonl`. The command also queries the actual
Grafana datasource and saves `grafana-query.json`. Stop with Ctrl+C after recording the view.

### Demo 2 · run the supplied missing-fields version

```bash
python3 "$W5_PACKAGE/prepare.py" 07 "$W5_ATTEMPT/owned"
python3 "$W5_PACKAGE/run.py" telemetry --source "$W5_ATTEMPT/owned" --workspace "$W5_ATTEMPT/before-view"
```

Expect the request-filtered datasource check to fail: a span can exist without the needed requestId
tag. Inspect retained local/collector output before repair.

Offline trace: browser SAVE_FAILED ID demo-17; .NET completion status 500; span requestId demo-17,
outcome rejected, traceId abc...; Grafana exact-ID filter returns that same span. This is a supplied
trace, not your execution evidence.

## Practical challenge

Complete the tags and structured log after `await next(context)` in `$W5_ATTEMPT/owned/Api/Program.cs`.
Include requestId, numeric status, accepted/rejected outcome and traceId; mark failed span status.
Run telemetry against your source with a new output path:

```bash
python3 "$W5_PACKAGE/run.py" telemetry --source "$W5_ATTEMPT/owned" --workspace "$W5_ATTEMPT/after-view"
```

In the printed browser, start a session, move East, tick Fail next save and move East; correlate this
second, learner-triggered request in the view. Independently reload the session to show unchanged
state. Capture only bounded metadata.

### Acceptance criteria

* `before-view`: `FAIL request-filtered data-source check` (retain it).
* `after-view`: `PASS request-filtered data-source check`; `grafana-query.json` holds a `game.action`
  record with your request ID, `status` 500, `outcome` `rejected` and a `traceId`.
* `api.log` holds a JSON completion log whose `State` has `RequestId`, `Status`, `Outcome`, `TraceId`.
* Your own browser-triggered failure is found by its request ID in Grafana, and Load session shows
  the unchanged state.

## Staged hints

1. The response/error uses `context.TraceIdentifier`.
2. Tag after the inner middleware has converted storage failure to HTTP 500.
3. Use `SetTag` for searchable span fields and `LogInformation` with named placeholders; do not replace
   the request ID with trace ID.

## Check and recovery

Show your browser/error ID, named .NET fields and matching Grafana result. Explain why a local span file
alone would not demonstrate collector delivery. Empty results require checking ID, time range, listener
and collector delivery (`collector.log`), not inventing a trace. Use [evidence.md](evidence.md).

If blocked, preserve the attempt and commands first. Use a new prepared copy for comparison, then
explain the difference before applying a repair to your owned work.

**Teardown:** Ctrl+C; `run.py` stops its processes and removes only its own Loki/Grafana pod.

## Individual knowledge check

1. Distinguish a completion log, failure-count metric and timed action span.
2. Trace the prepared SDK → JSON collector → Loki → Grafana path; which part is not OTLP?
3. Why add tags after await next(context), and why use a named log template?
4. A browser error has an ID but Grafana is empty. Give two checks before blaming storage.
5. Individually connect one browser/error requestId to its .NET completion and real Grafana record;
   explain the status and unchanged GET.

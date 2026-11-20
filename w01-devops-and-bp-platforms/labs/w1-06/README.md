# W1.06 lab: Connect the page and API

The supplied application has a frontend page and a separate reference-board API. Your browser can display the page
before its board request succeeds. Connect the front-end and API containers using supplied configuration, then repair
an incorrect API address. Keep a configuration file and diagram that explain the result together: the file gives a
process its destination, while the diagram identifies the process interpreting that destination.

## Timing

| Block | Minutes |
|---|---|
| Retrieval, concepts and worked examples | about 45 |
| Guided practice (diagram, prepared first repair, own explanation) | 15 |
| Challenge: Task 1 10, Task 2 10, Task 3 15, Task 4 10 | 45 |
| Knowledge check, individual evidence and transfer | 15 |
| Recovery and consolidation | 10 |

## Outcomes

* Explain the browser-visible and container-to-container addresses using a supplied execution diagram.
* Describe the few environment-specific settings needed by the starter application.
* Annotate the supplied configuration with its service names, hosts and ports.
* Debug one deliberately incorrect API address and verify the corrected request path.

## Brief and ownership

You edit only [`code/starter/settings.env`](code/starter/settings.env),
[`code/starter/changed-request.env`](code/starter/changed-request.env), the diagram annotations
([`diagram/`](diagram/)) and your evidence sheet ([`evidence.md`](evidence.md)). Keep network aliases, API role, listener
ports, browser policy and image unchanged. Do not publish the API, add credentials or write web application code. The
prepared network, image ([`code/supplied-runtime/`](code/supplied-runtime/)), browser adapter, listeners and launcher
([`code/lab.py`](code/lab.py)) are supplied. Work in pairs and rotate operator/observer after Task 2.

## Setup: start from the prepared checkpoint

Python 3, Podman 5.4.2 or later with working DNS-enabled bridge networking, the built image and a browser (re-tested
with Podman 5.7.0). The reference image uses ASP.NET 10.0.12. The facilitator prepares the image with
`python3 lab.py prepare` from `code`. No account or BP tenant is required for this local route.
[`starter/run.py`](starter/run.py) is an alternative launcher entrypoint that delegates to `code/lab.py`; from this lab
directory, `python3 starter/run.py check` is equivalent to the check command from `code`.

```bash
cd code
python3 lab.py up --settings starter/settings.env
```

Read `READY` and the printed URL, normally `http://127.0.0.1:4316/`. Open it and click **Load reference board**. The
unmodified starter deliberately produces frontend HTTP 502. `up` separately probes the fixed API alias to prove the
supplied connection is available; a `PREPARATION REQUIRED` message needs facilitator attention. If the port is
occupied, the facilitator can select `--port 4317`; repeat it on each `up`. Do not copy an allocated IP into the settings.

| Key | Reader and use | What to annotate |
|---|---|---|
| `API_UPSTREAM` | Frontend process: base address for its API request | Initiator, API host and port |
| `BROWSER_API_URL` | Browser adapter: requested resource | Initiator and resolved URL |
| `PUBLIC_LABEL` | Frontend exposes a public environment label | Which configuration was loaded |

Worked examples: [`../../examples/w1-06/README.md`](../../examples/w1-06/README.md).

## Guided practice

Annotate [`diagram/starter.mmd`](diagram/starter.mmd) (or [`diagram/text-table.md`](diagram/text-table.md)): add the
missing host/port labels and each setting's reader; point to where a loopback address is interpreted. Then reset a saved
copy of [`code/guided/settings.env`](code/guided/settings.env) to its loopback value, start it, record the frontend
error and apply the demonstrated one-line edit. Switch roles and explain the result without reading the edit aloud.

## Task 1: retain the failing observation and annotate the route (10 minutes)

Copy the starter's original three lines into your evidence sheet before editing. Record the browser's requested URL,
HTTP status, body service identity and upstream observation. Compare destinations from the same caller:

```bash
python3 lab.py probe --from frontend --url http://api:8181/api/boards/reference
python3 lab.py probe --from frontend --url http://127.0.0.1:8181/api/boards/reference
```

The first returns the API response. The second intentionally exits 3 with `NO_HTTP_RESPONSE`; keep it. Explain why the
failed loopback probe does not contradict the alias probe.

## Task 2: connect and verify the first configuration (10 minutes)

Save the original under a new name, then apply the demonstrated repair to `code/starter/settings.env`, keeping
`PUBLIC_LABEL` and the browser path unchanged.

```bash
python3 lab.py up --settings starter/settings.env
python3 lab.py check
```

Reload, click **Load reference board** (API identity `w106-reference-api`, board `reference`, 3 by 3, `initialMoves` 6),
then **Request missing board** (API 404 `NOT_FOUND` with the API identity). The check command verifies an actual HTTP
response through the configured route; it does not execute the browser adapter, so keep the separate browser observation.

## Task 3: investigate the changed request (15 minutes)

```bash
python3 lab.py up --settings starter/changed-request.env
```

Reload and click **Load reference board**. Before editing, record the requested URL, whether a response status exists,
the upstream observation and the fixed container probe result. Select the setting to investigate with a reason tied to
the initiating process; name a plausible alternative edit and predict which observation it would leave unchanged. Make
the smallest justified correction in a saved copy, apply it with `up` and repeat the browser request. Keep the API
unpublished and the same-origin policy unchanged. Do not name a DNS failure unless an observation shows a failed lookup.

## Task 4: test recovery and hand over the evidence (10 minutes)

With your corrected configuration running, stop only the supplied API and repeat the browser request; predict what
should change when the same API restarts without any address edit. Run these separately, with a browser request
between them and another after restart:

```bash
python3 lab.py stop-api
python3 lab.py start-api
```

The middle request must receive frontend 502; the final request must return the original API identity and reference
board. Complete the diagram's response labels (browser operation, container probe, frontend-generated).

## Acceptance criteria

- [ ] The first configuration connects the frontend to the reference API and retains its original failure.
- [ ] The diagram or table labels the actual browser host URL, frontend listener, network alias, API listener and both requesting processes.
- [ ] All three settings have their reader and public purpose annotated; no credentials are embedded.
- [ ] The changed case has a pre-edit setting choice, caller-based justification and plausible rejected alternative.
- [ ] The corrected changed case returns `w106-reference-api`, board `reference`, 3-by-3 dimensions and `initialMoves` 6 through an actual browser click.
- [ ] API 404, frontend 502 and absent browser HTTP response are distinguished without claiming an unobserved DNS failure.
- [ ] Stopped-API failure and unchanged-address recovery are retained; supplied policy and API publication remain intact.
- [ ] Each learner has an individual explanation, assistance record and scheduled revisit.

## Three-stage hints

<details><summary>Hint 1: locate the request boundary</summary>

Find the operation whose result differs from Task 2. Name its initiating process and mark its arrow. Compare that caller
with the successful supplied probe's caller. Do the two observations establish the same route?
</details>

<details><summary>Hint 2: expose the intermediate state</summary>

Place the displayed requested URL beside the three current settings. Record whether an HTTP response exists and copy the
upstream observation. Add the container probe in a separate row. Locate the last confirmed working boundary.
</details>

<details><summary>Hint 3: finish a bounded trial operation</summary>

Start this evidence row: caller = browser; response status = absent; container probe = API 200. Complete
`python3 lab.py up --settings starter/<your-saved-trial>.env` with the filename of your saved trial configuration after
finishing its one justified value; the marked filename is an editing prompt, not a runnable command.
</details>

## Individual evidence

Choose the address to inspect for a browser/API failure and justify it using your diagram. New observation: the browser
request and upstream response both identify the expected API, but the body names a different board from the requested
one. Do you inspect network addresses or the API's resource handling first, and why?

## Transfer: a booking preview

A booking-preview page is served successfully, and its server returns a reservation API's rejection for an unavailable
slot. Explain how that received rejection differs from the server failing to contact the reservation API.

## Knowledge check (8 minutes)

1. The fixture moves to another workstation: host port 4320; listeners 8080 and 8181, alias api. Which browser-arrow annotation preserves the route?
   A) Browser requests `http://api:8181`, because both workstations use the same image.
   B) Browser requests `http://127.0.0.1:4320`, while the frontend's separate API arrow still uses `api:8181`.
   C) Browser requests `http://127.0.0.1:8080`, because an internal listener always overrides the host mapping.
   D) Browser requests the API's allocated numeric IP, because a new host port makes names unreliable.
2. A support form needs the failed request's scheme, host, port, path and status; the URL also contains a sensitive token query value and the form accepts `[REDACTED]` for credentials. Which submission works?
   A) Replace the whole URL with `[REDACTED]` and keep only the status.
   B) Submit the full URL unchanged because the route fields are mandatory.
   C) Retain the scheme, host, port, path and actual status, replacing only the credential query value with `[REDACTED]`.
   D) Replace the original host and port with the internal API alias and listener before submitting.
3. Your diagram says the frontend reads file B; the launch record names file A and the page shows A's label. Which action resolves the mismatch?
   A) Rename B to look like A without checking the command.
   B) Record that A is active, compare its values with the intended B values, then explicitly start the frontend with B and verify B's label and route.
   C) Rebuild the unchanged image and leave the frontend running.
   D) Change the API's allocated IP to match the diagram.
4. The corrected fixture worked earlier; now the browser receives frontend 502, the owned API container is stopped, and saved addresses match the last success. You may only inspect and record. Next action?
   A) Change the upstream to a new IP and report recovery before another request.
   B) Restart the API anyway, because a likely correction makes approval unnecessary.
   C) Report the stopped API and matching saved configuration, preserve the frontend error, and request the permitted recovery action before claiming a restored path.
   D) Record the earlier successful response as the current result.
5. Configuration A produced a normal-board API 200; the frontend was replaced with B, whose only check so far was the missing-board 404. The handover needs both results from the current configuration. What next?
   A) Combine A's normal 200 with B's missing 404.
   B) Record B as a DNS failure because its observed response is 404.
   C) Preserve both dated results, then execute and verify B's normal-board request before deciding whether B meets both required checks.
   D) Change the API image immediately.

## Recovery, accessibility and cleanup

Save attempted settings and notes before starting [`code/checkpoints/core.env`](code/checkpoints/core.env) as a separate
supported configuration (it supports the first connection; the changed case still needs your decision). If the engine
is unavailable, mark environment blocked and analyse [`captures/observations.md`](captures/observations.md). Oral
explanation, a typed table, an annotated image or a recording are equivalent. When your observations are saved, run
from `code`:

```bash
python3 lab.py down
```

It removes only this workspace's containers and network and keeps the image and your files. Do not use engine-wide
prune commands or delete another learner's resources.

## Optional depth

Describe the preparation needed for direct browser-to-API access (publication, a cross-origin contract) without
implementing it or weakening the current policy.

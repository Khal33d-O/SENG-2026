# W1.10 verification document (smoke checklist and correlated request)

Version checked: release ____  DLL sha256 ____  Intended environment ____  Workspace path ____
Browser: Chromium (Playwright) / emulated client    Live / recorded: ____

## Smoke checklist
| Row | Destination / interaction | Expected observation | Actual observation | Evidence location |
|---|---|---|---|---|
| Page | open the printed URL | page with fixture selector and Load board | | |
| Reference API body | Load board (Reference) | HTTP 200, 3x3 board, 6 initial moves, request ID echoed | | |
| Public environment | X-Lab-Environment | ____ | | |
| Health | GET /healthz | 200 Healthy (narrow liveness only) | | |
| Missing (defined error) | Load board (Missing) | 404 NOT_FOUND received (not retried) | | |

## Failed Slow action (before the change)
* Action ID / request ID:
* Browser outcome, attempts, action elapsed:
* Matching row: path, result_status, response_status, elapsed_ms, caller_aborted:
* Raw query file / Grafana URL:
* Annotation: what the caller received vs what the server did; the interval each clock measures:

## Prediction (written BEFORE apply)
* Chosen client.json: ____  Why (from the observed timings):
* Predicted outcome, number of attempts, completion fields, environment, preserved reference/health:
* Competing configuration (valid under the budget) and the check that distinguishes it:

## Results
| Case | Configuration | Outcome | Action elapsed | Request ID | Matching row |
|---|---|---|---|---|---|
| Slow (chosen) | | | | | |
| Slow (competing) | | | | | |
| Overdue | | | | | |
| Reference / Missing recheck | | | | | |

## Recovery
* Backup directories (before / after):
* How to restore: copy saved files back, apply, verify a fresh request.

## Individual explanation and assistance
* Why a healthy resource alone does not prove this browser/API interaction works (my request):
* Assistance used: ____  Next check for the project: ____

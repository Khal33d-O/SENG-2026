# W1.01 notes: request and deployment path

Keep your first prediction; add corrections underneath with their reason. Record whether each observation
was **live** or **captured** (see `captures/observations.md`). Remove personal information from screenshots.

## Diagnostic trace (`diagnostic.js`)

| Run | `accepted` | Value before the condition | Value displayed | Statement that changed it (or was skipped) |
|---|---|---|---|---|
| Prediction 1 | `true` | | | |
| Actual 1 | `true` | | | |
| Prediction 2 | `false` | | | |
| Actual 2 | `false` | | | |

## Task 1: successful exchange

* Browser execution location:
* API execution location:
* Method and path observed in Network:
* Status observed:
* One body field and value (linked to which arrow?):
* Release header / environment header:

## Task 2: source, recipe, image, settings

* File containing the release label:
* Build recipe:
* Actual image identity (name and ID):
* Runtime setting and value:
* Why can an edited host file and an existing image show different releases?
* Today I own: ____. Supplied: ____. Managed platform responsibilities: ____.

## Task 3: changed request (Missing board)

* Prediction (write BEFORE inspecting):
* Observed method/path:
* Observed status and body detail:
* Choice: rebuild the unchanged image, or inspect/correct the requested resource? Why?
* Evidence that would instead suggest an unreachable service:

## Task 4: modelling decision and peer check

* Shared API element or separate case annotations? Why?
* Peer question received / asked:
* Roles rotated (annotation / review):

## Remaining uncertainty (for the W1.04 request-path revisit)

*

## Individual evidence (minutes 95–100)

* Board case: browser and API execute ____; the changed request is received by ____ because ____.
* Equipment variation (`GET /api/equipment/pump-17` → 404 "Equipment not found"): receiver ____; next observation before any rebuild ____; relationship that transfers ____; label that changes ____.

## Assistance and environment

* Assistance level: demonstrated independently / demonstrated with a prompt / completed with guided support / not yet demonstrated
* Environment or account blocks (kept separate from understanding):
* Support note (operation attempted, observed result, boundary I cannot verify):

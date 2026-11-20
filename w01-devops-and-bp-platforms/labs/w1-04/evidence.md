# W1.04 investigation record

Learner label: ____  Partner: ____  Engine and version: ____  Live / captured: ____

## Identifiers
* Image (package) reference and image ID:
* My instance name(s) and container ID(s):
* Which identifier selects the package; which selects the instance:

## Task 1: initial failure
* `make smoke` / `check-config` result:
* `make test` / `verify` first result (earliest error line):
* Did the engine create the instance? Setup problem or reachability failure?

## Task 2: diagnosis before editing
| Observation | Value | Execution location |
|---|---|---|
| Browser URL requested | | browser / host |
| Instance state | | engine |
| Published mapping (`port`) | | engine |
| Listener line (`logs`) | | container |
| Request result | | browser |

* My run / inspect / stop commands and what each selects:
* Proposed mapping change and supporting observation:
* Why changing the browser's port would / would not satisfy the task:
* A result that would make me reconsider:

## Task 3: repair, stopped process, recovery
* Changed field, before → after:
* Verify result after the edit:
* Stopped state + old listener log + fresh request result:
* Recovery run result:

## Task 4: changed profile and endpoint 9124
* Observed listener in the changed profile (from logs):
* Proposal 1 (host number only): preserves / violates:
* Proposal 2 (container number only): preserves / violates:
* My mapping and why:
* Prediction (before running) for old endpoint, new endpoint, and after stopping:
* Actual results:

## Individual explanation, assistance, cleanup
* Explanation in my own words:
* Assistance used:
* Instances removed:
* Next revisit:

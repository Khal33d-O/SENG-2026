# W1.04 lab: Run and diagnose the supplied application

Your team has a supplied application image, a requested browser endpoint and a mapping that fails to serve the
page. Run the supplied application image and diagnose a deliberately incorrect port mapping. Keep one investigation
record containing the failure, your prediction, the repair and the changed-case explanation.

## Timing

| Block | Minutes |
|---|---|
| Retrieval, concepts and worked examples | about 45 |
| Guided practice (`guided/mapping.json`, known-good route) | 15 |
| Challenge: briefing 1, Task 1 8, Task 2 12, Task 3 12, Task 4 12 | 45 |
| Quiz (minutes 102–110), individual evidence and transfer | 15 |
| Recovery and consolidation | 10 |

## Outcomes

* Describe the difference between a container image and a running container.
* Explain how ports, processes and container logs affect application accessibility.
* Write commands to run, inspect and stop a supplied application container.
* Debug an incorrect port mapping using observed container and browser behaviour.

## Supplied and owned

You own [`starter/mapping.json`](starter/mapping.json), your copy `starter/changed-mapping.json` (Task 4), the
commands you write and your evidence in [`evidence.md`](evidence.md). The application, image recipe
([`image/`](image/)), response fixture ([`fixtures/reference-board.json`](fixtures/reference-board.json)), profiles
([`profiles/`](profiles/)) and [`lab.py`](lab.py) adapter are supplied. Do not edit those files to make a check pass.
No C#, Dockerfile, network administration or game-rule implementation is required.

## Setup and command support

Prepared local shell, Python 3 and a container engine. The image is `localhost/academy-w104:10.0.12`; the facilitator
prepares it with `python3 lab.py prepare` (builds [`image/Containerfile`](image/Containerfile)). The book's rehearsal
used Podman 5.4.2; these materials were re-tested with Podman 5.7.0.

```bash
pwd
export LAB_ENGINE=podman
python3 lab.py check-config
```

On the prepared Docker route use `export LAB_ENGINE=docker` instead. If the coordinator supplied another exact image
name, set `LAB_IMAGE` as directed. Missing engine access or image preparation is an environment blocker: keep the error
and use [`captures/observations.md`](captures/observations.md) for interpretation. Do not install an engine or select an
unrelated image during the challenge.

JSON stores named values. `host_port` and `container_port` are the two numbers you may change; numbers are not quoted.
Preserve commas and braces. `_metadata` is ignored by the runner. Save a copy of your first attempt before accepting a
recovery file from the facilitator.

## Worked examples (instructor)

See [`../../examples/w1-04/README.md`](../../examples/w1-04/README.md): establish the starting state, run the supplied
image on 9100, inspect process and logs, predict and verify a replacement on 9101, retain evidence and stop.

## Guided practice: rehearse a working route

```bash
python3 lab.py run --config guided/mapping.json --name w104-guided
python3 lab.py inspect --name w104-guided
python3 lab.py probe --config guided/mapping.json
```

Open `http://127.0.0.1:9102/`, select **Load board** and compare the response with the supplied reference data.
Annotate the host and container numbers in the printed command. Write the corresponding direct engine inspection
command, then execute it with your partner. Stop and remove `w104-guided` with the adapter
(`python3 lab.py stop --name w104-guided`, `python3 lab.py remove --name w104-guided`), then request the same URL again
and compare.

## Task 1: collect the initial failure (8 minutes)

Record the engine version and supplied image identity (the module's `--version` and `image inspect` commands). State
which identifier selects the package and which name will select your instance. Agree an unused name beginning `w104-`.

```bash
make smoke
make test
```

Without make: `python3 lab.py check-config` and `python3 lab.py verify`. The configuration check should pass; the
reachability test should **fail** because the starter mapping contains a deliberate defect. The runner creates and
removes its own temporary instance even when the request fails. Distinguish an engine that cannot create the instance
from a created, running instance that cannot serve the requested URL.

## Task 2: diagnose before editing (12 minutes)

The required initial browser endpoint is `http://127.0.0.1:9123/`. Keep that endpoint and the normal profile unchanged.

```bash
python3 lab.py run --name w104-work
python3 lab.py inspect --name w104-work
python3 lab.py probe
```

In the browser, request the page and `/api/boards/reference` at the required endpoint. Retain the instance name,
running state, published mapping, listener line and request result. Write your own run, inspect and stop commands and
label what each selects. Propose one mapping change, the observation supporting it, why changing the browser's
requested port would or would not satisfy the task, and a result that would make you reconsider — **before** editing.

```bash
python3 lab.py stop --name w104-work
python3 lab.py remove --name w104-work
```

The adapter refuses to stop or remove an instance unless its name and `academy.module=w1-04` label identify it as a
W1.04 lab instance.

## Task 3: repair, distinguish a stopped process and recover (12 minutes)

Edit only the mapping field supported by your diagnosis and run `make test` (or `python3 lab.py verify`) again. Required
outcome: HTTP 200 containing the exact supplied reference-board fixture (board ID `reference`, `initialMoves` 6). Start
your repaired named instance, confirm in the browser, run your inspection command, then stop it and request the same
URL again. Record the stopped state beside the old listener log and explain why a retained startup line cannot
establish that the process is currently available. Remove the stopped instance and run the repaired mapping again.

## Task 4: defend the changed-mapping prediction (12 minutes)

The application now uses the supplied changed profile and the browser must use host port **9124**; the image stays the
same. Copy your repaired mapping to `starter/changed-mapping.json` (do not overwrite your first repair). Start a
temporary observation instance, read its state and startup logs, then stop and remove it:

```bash
python3 lab.py run --config starter/changed-mapping.json \
  --profile changed --name w104-observe
python3 lab.py inspect --name w104-observe
```

Two colleagues propose repairs: one changes only the host number of your earlier mapping, the other only its container
number. Decide whether either satisfies all the new constraints, citing the new listener observation. Predict the
result at both the old and new browser endpoints (and after stopping) **before** testing. Then edit the copy and test:

```bash
python3 lab.py verify --config starter/changed-mapping.json \
  --profile changed
```

For your browser comparison, run an owned named replacement with the same config and profile, request both URLs, then
stop it and request again.

## Acceptance criteria

- [ ] Identify the supplied image and one actual container instance, explaining what each identifier selects.
- [ ] Write and use commands to run, inspect and stop your named supplied container; explain their arguments.
- [ ] Retain the initial failure, current process state, mapping and listener evidence before proposing the first repair.
- [ ] Repair the mapping while preserving the required browser endpoint, and verify the page plus exact response fixture.
- [ ] Show a stopped-process failure and recovery, distinguishing it from the original failure while the process was running.
- [ ] Predict the changed case before the verification run, evaluate both incomplete proposals, test both browser endpoints and defend the result using current evidence.
- [ ] Record assistance, each partner's own explanation, cleanup and one specific next revisit if support was needed.

## Hints

<details><summary>Hint 1: choose observations</summary>

Separate the browser's address, the engine's published mapping and the application's reported listener. Put each
observation beside its execution location. A browser error gives less information about process state than a current
inspection does.
</details>

<details><summary>Hint 2: compare the constraints</summary>

The requested browser endpoint is a requirement. The listener comes from the current process evidence. Test each
proposed edit against both statements, including whether the earlier listener assumption still holds in the changed
profile.
</details>

<details><summary>Hint 3: construct and challenge your explanation</summary>

Write a three-column table: current browser endpoint, published destination, observed application listener. For each
proposal, mark which cells change. Complete this partial operation with your observed value:
`127.0.0.1:9124:OBSERVED_LISTENER`. Replace the final label with the port from the current profile's logs; do not paste
the label as a literal argument.
</details>

## Transfer

An internal equipment-booking service runs on a managed host; its owner reports that the application listens at
container port 7000, and your browser uses an approved URL on a different machine. State which missing access
information you would request before proposing a port change, and which parts of your local investigation still apply.
Do not invent a BP route.

## Knowledge check (8 minutes)

1. Two containers use the same image ID. One is running; the other has stopped. Which explanation is supported?
   A) Stopping one changed the source image, so the other must restart.
   B) Their packaged starting point agrees, while each instance has its own runtime state.
   C) They must both have the same published host port because their image IDs agree.
   D) The stopped instance proves that the image no longer exists in the engine.
2. A browser request fails. Current inspection says the selected container is running, and its latest startup log reports a listener on container port 6000. What observation most directly checks whether forwarding selects that listener?
   A) Inspect the published destination for the requested host endpoint.
   B) Count how many files the image contains.
   C) Reopen a screenshot of the page from yesterday.
   D) Stop another person's container so fewer processes remain.
3. You created a container named `w104-test` from `localhost/academy-w104:10.0.12` and need to stop that instance. Which command selects it?
   A) `docker stop localhost/academy-w104:10.0.12`
   B) `docker image inspect w104-test`
   C) `docker stop w104-test`
   D) `docker logs w104-test`
4. A local report service listens on container port 6000. Its replacement uses `127.0.0.1:9400:6000`; the earlier instance was removed. A colleague plans to request `http://127.0.0.1:6000/`. Which prediction is justified?
   A) It reaches the replacement because the application listener is 6000.
   B) It reaches the replacement because every published port opens both numbers on the host.
   C) It fails because host and container port numbers must match.
   D) That URL does not select the replacement's published host endpoint; port 9400 is the expected route.
5. A container's old log still contains "Now listening" after its state changes to stopped. A fresh browser request fails. What should the record say?
   A) The old log proves the listener is still active, so the browser must be faulty.
   B) The log records an earlier startup; the current stopped process cannot serve this request.
   C) The image must have been rebuilt when the stop command ran.
   D) Increasing the host port number restarts the stopped process.

## Recovery, accessibility and teardown

Pairs rotate the terminal role after Task 1 and for the changed-case run; either person may dictate commands. If time
is short, preserve your attempted mapping and use a labelled facilitator checkpoint; still give an individual
changed-case prediction. Stop and remove only the named instances you created; the check runner removes its own. Leave
the supplied image cached. Avoid broad cleanup commands or deleting another person's instance to free a port; ask the
facilitator for an unused endpoint if a required port is occupied.

## Optional depth

Compare the actual image IDs of normal and changed-profile instances and explain how their packaged starting point can
agree while their listener settings differ.

# W1.01 lab: annotate a request and deployment path

A teammate reports that the starter page opens but a board lookup fails. They propose rebuilding the image.
Annotate the working browser-to-API request, locate the source/image/configuration behind it, and decide
whether that proposal follows from the failed request's evidence. Keep your decision in the same diagram and
notes so another person can follow the diagnosis.

## Timing

| Minutes | Activity |
|---|---|
| 0–35 | Diagnostic, concepts and the instructor's two worked examples |
| 35–50 | Guided preparation (diagram statement, supplied artifacts, verify an annotation) |
| 50–95 | Lab challenge, four tasks. Checkpoints: request and deployment artifacts located by 65; changed-input result and justified next action by 80; revision and individual notes by 95 |
| 95–100 | Individual evidence (four minutes board case, one minute equipment variation) |
| Debrief | Knowledge check (about 8 minutes) |

## Outcomes

* Describe one browser-to-API request, identifying where each part executes.
* Explain how the supplied application's source, image and deployment configuration relate.
* Describe the boundary between learner-owned changes and managed platform responsibilities.
* Annotate the working request and deployment path using the supplied diagram.

## Supplied and owned

| You own | Supplied for inspection (do not edit) |
|---|---|
| [`starter/starter.mmd`](starter/starter.mmd) (work on a copy) | [`starter/supplied-runtime/Program.cs`](starter/supplied-runtime/Program.cs) – contains the release label |
| [`starter/notes.md`](starter/notes.md) (work on a copy) | [`starter/supplied-runtime/Containerfile`](starter/supplied-runtime/Containerfile) – the build recipe |
| | [`starter/supplied-runtime/runtime.env`](starter/supplied-runtime/runtime.env) – the public setting `LAB_ENV` |
| | The page (`supplied-runtime/wwwroot/`), the board API, [`starter/starter.png`](starter/starter.png), [`starter/starter-text.md`](starter/starter-text.md), [`starter/diagnostic.js`](starter/diagnostic.js), [`starter/captures/observations.md`](starter/captures/observations.md) |

Your instructor operates the supplied container demonstration. The challenge requires you to interpret the
observations and identify the boundary to investigate; C# implementation and platform administration are
supplied support.

## Prerequisites

* A browser with developer tools (Network panel).
* An editor that opens `.mmd` and `.md` files. A Mermaid preview is optional: you may annotate `starter.png`
  or use the numbered text alternative. Drawing skill is not assessed.
* Node.js (course pin 22.23.2), only to run the diagnostic file.
* The instructor's prepared service; instructor setup is in [`../../examples/w1-01/README.md`](../../examples/w1-01/README.md)
  (.NET SDK 10.0.401 targeting `net10.0`, Podman).

## Diagnostic activity: trace a short program

The supplied file [`starter/diagnostic.js`](starter/diagnostic.js) contains:

```js
let moves = 6;
let accepted = true;
if (accepted) {
  moves = moves - 1;
}
console.log(moves);
```

The syntax key is supplied: `let` names a value you can replace, `=` assigns it, and `if` runs its enclosed
statements when the condition is true. `console.log` displays the value. The semicolon ends a statement.

**Activity: Predict.** What value is displayed, and which statement changes it?

**Activity: Type.** Set `accepted` to `false`, leaving the other statements unchanged, run the file and compare the
output with your prediction. Record the value before the condition and the value after it.

```bash
node starter/diagnostic.js
```

## Starting checkpoint

1. Use the running page supplied by your instructor. On a prepared local computer, use the exact address printed
   when the service starts (the demonstration uses `http://127.0.0.1:5081`). A loopback address beginning
   `127.0.0.1` refers to the computer running your browser, so another learner's loopback address does not reach
   their computer.
2. Open this lab folder in your editor. Make working copies of `starter.mmd` and `notes.md`, retaining the originals.
3. Open the browser menu, choose **More tools**, then **Developer tools**, and select **Network**. Filter with `boards`.
4. With **Reference treasure hunt** selected, press **Load board** once and select its request row.
5. In **Headers**, find the method, path and response status. In **Response**, identify a board field and value.
   The panel records while open; repeat the interaction if it was closed earlier.

[`starter/captures/observations.md`](starter/captures/observations.md) provides recorded results for environment
recovery. They are data you may inspect; they do not supply your interpretation. Record whether your observations
were live or captured. Keep account failures separate from conceptual difficulties.

## Worked examples (instructor demonstration)

See [`../../examples/w1-01/README.md`](../../examples/w1-01/README.md).

1. **Follow the board request.** `GET /api/boards/reference`, status `200`, body with `width: 3`, `height: 3` and
   `initialMoves: 6`. The page reports `HTTP 200 | foundation-a | workshop-blue`.
2. **Follow a changed release.** A copy of the source changed from `foundation-a` to `foundation-b`. The original
   container still reports `foundation-a` until the copy is published, built as image `w1-01-b` and started. The same
   `w1-01-b` image started with `LAB_ENV=workshop-green` reports `foundation-b` and `workshop-green`.

## Guided practice

1. Open `starter.mmd` and `notes.md`. Name the browser and API execution locations, label the outward request with
   its method and path, and give the return arrow its status and the body field you checked. Keep image-building
   arrows separate from request arrows: an HTTP request does not build an image.
   **Activity: Discuss.** Which arrow represents a message that occurs when you press Load board, and which arrow
   represents work done before the container started?
2. Read one diagram statement:

```text
Browser -->|GET /api/boards/reference|Api
```

   `Browser` and `Api` identify diagram elements. The arrow points from sender to receiver, and the text between the
   vertical bars labels the message. This line is diagram syntax; it does not call the API. Change one unfinished
   label, then render or reread it. Preserve element names so connections still refer to the intended element.
3. Locate `Program.cs`, `Containerfile` and `runtime.env` in `supplied-runtime/`. Add them to the preparation side.
   Connect the built image to the running API and the settings to that same running process; explain why two inputs
   meet there.
4. Compare your successful-request arrows with the supplied capture, then record one remaining uncertainty in
   `notes.md` (for example "I cannot identify which image is running").

## Lab challenge tasks

1. **Complete the successful exchange.** Identify browser and API execution locations, label the outgoing
   method/path and returning status/body, and connect one arrow to one recorded field in `notes.md`.
2. **Locate the artifacts.** Find the source containing the release label, the build recipe, an actual image
   identity and the runtime setting. Connect them to the running process while keeping build/start operations
   distinct from HTTP messages. Explain why an edited host file and an existing image can show different releases.
   Mark today's annotation ownership and the supplied/managed responsibilities.
3. **Predict, then inspect the Missing board request.** Record its method/path, status and useful body detail.
   Choose between rebuilding the unchanged image and inspecting/correcting the requested resource; justify the choice
   from the observed boundary and identify what different evidence would suggest an unreachable service. Keep the
   application implementation unchanged.
   **Activity: Predict.** If the page remains visible but the board lookup fails, which evidence would determine
   whether the API received the request?
4. **Revise the model and defend one design decision.** Decide whether both cases share the API element or use
   separate case annotations. Exchange a peer question, rotate annotation/review roles, and retain your own
   explanation of which component receives a changed request.

## Acceptance criteria

- [ ] The browser and API are distinct execution locations, including on one local computer.
- [ ] Labelled request/response arrows match the observed method, path, status and a meaningful board field.
- [ ] Named source, build recipe, image identity and settings connect to the running process through meaningful relationships.
- [ ] Every element has a connected role; every arrow has a label; preparation operations are distinct from runtime messages.
- [ ] Your changed-input note preserves prediction, observed result, chosen next action and the evidence supporting that choice.
- [ ] One modelling decision is explained, with today's learner-owned work and supplied/managed responsibilities distinguished.
- [ ] Individual explanation and assistance are recorded separately from completion of a shared diagram.

Parser success confirms usable diagram syntax; a human still checks whether the labels explain the observations.

## Hints

<details><summary>Hint 1: locate the boundary</summary>

Focus on the failed board interaction. Identify the requested resource and determine whether the browser recorded
an HTTP response. Compare that evidence with the proposed image rebuild: which part of the proposal would alter the
value in the request path?
</details>

<details><summary>Hint 2: expose the intermediate observation</summary>

Write separate notes for method/path, returned status/body, and release header. Separating these facts can reveal a
resource failure while a process still returns a response from the expected package. A failed lookup alone cannot
establish that a process stopped.
</details>

<details><summary>Hint 3: complete part of the explanation</summary>

Start with: "The browser sent a GET request for ___ to ___. I observed ___, so my next check is ___." Fill the blanks
using your capture, then explain how that check differs from rebuilding unchanged source. Ask a partner to verify
the observations while you form the explanation.
</details>

## Individual evidence

Identify where the browser and API execute and which component receives a changed request (four minutes). Then,
for one minute: an internal equipment page sends `GET /api/equipment/pump-17` to its API and receives 404,
"Equipment not found". Identify the receiver and the next observation to inspect before proposing an image rebuild.
Name a relationship that transfers from your diagram and a label that changes; do not call this illustrative
endpoint on the starter. Record demonstrated independently, demonstrated with a prompt, completed with guided
support, or not yet demonstrated, and list any environment block separately.

## Knowledge check (about 8 minutes, self-check, not graded)

1. A browser and the supplied API both run on your laptop. Pressing Load board records GET /api/boards/reference and a 200 response. Which annotation correctly locates the work?
   A) The browser runs both the page script and the API handler because the address is local.
   B) The browser sends the request; a separate server process handles it and returns the board.
   C) The container image sends the request directly to the browser whenever its source changes.
   D) The request must have reached a remote BP service because every API runs in a cloud tenant.
2. An instructor changes the release text in a separate source copy but leaves the original container running. Its response still reports foundation-a. Which explanation fits this demonstration?
   A) The browser must be broken because every saved source edit instantly changes a running image.
   B) The environment variable prevents the application from reading its source file on each request.
   C) The existing process uses the earlier packaged files; the changed copy needs publishing, packaging and a new process.
   D) A board response can never contain a release header, so the observation must be invalid.
3. Two new containers start from the same foundation-b image. One reports workshop-blue and the other workshop-green, with identical board data. Which artifact explains the difference?
   A) The supplied LAB_ENV setting, which is provided separately when each process starts.
   B) The browser's Network filter, which rewrites the environment value inside the API.
   C) The treasure position, which chooses a deployment environment whenever the board loads.
   D) A new image build must have occurred because every differing response requires new packaged source.
4. Your local page works, but a prepared external training tenant rejects an access attempt. You have no approved tenant commands or permission details. What is the supported next action?
   A) Use a local container command against a guessed BP hostname because the application already works.
   B) Record the attempted operation and response, request the approved support route, and continue local annotation.
   C) Claim deployment success from the local 200 response and omit the access failure from the evidence.
   D) Change board coordinates until the tenant accepts the account, since both are application configuration.
5. A teammate draws the API's 404 response as "the server did not run". Network shows a response body with NOT_FOUND for /api/boards/missing. Which revision makes the diagram consistent with the observation?
   A) Delete the return arrow because only 200 responses count as HTTP messages.
   B) Add a second physical server solely because the requested resource name changed.
   C) Keep the API return path, label its 404/body, and explain that this requested board was missing.
   D) Replace the response arrow with an image-build arrow because rebuilding always repairs failed lookups.

## Recovery and teardown

Save the current diagram under a separate name before reopening the starter. Retain observed values and repair one
connection at a time; describe the two connected elements in a sentence before adjusting diagram syntax. If the
browser or renderer is unavailable, annotate `starter.png` or use `starter-text.md`; the captured request remains
available when a browser or local service cannot run. Recovery uses the remaining class time; required work is not
transferred to homework.

Save the diagram and notes together. Close the browser tab. Stop only a process you started, using Ctrl+C in its
terminal; the instructor stops their own demonstration containers. This local package creates no BP resources and
supplies no remote cleanup commands.

## Optional depth

Part 2: consider a response with the intended package but a different public environment label (captures, section 5).
Complete it only within remaining class time; it creates no prerequisite for the next session.

## Local route and BP boundary

The local Podman demonstration establishes local behaviour; its names and commands do not describe BP's deployment
procedure. `LAB_ENV` is a public workshop label, not a credential or BP environment name. For a blocked account or
tenant, record the symptom and request support through the approved course route.

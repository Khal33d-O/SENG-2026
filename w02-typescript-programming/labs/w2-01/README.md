# W2.01 Lab: Compile a script and update a supplied page label

**Session:** W2.01 TypeScript tooling and browser foundations · **Week 2: TypeScript Programming**

Your page must communicate **Ready to explore** through its supplied status paragraph. You will make
the TypeScript edit, correct a seeded compiler fault, and investigate a handover page whose displayed
message differs despite a successful build. The task is about compiling and executing a small program;
the page layout, element lookup and test infrastructure are supplied.

## Timing

| Block | Minutes |
|---|---|
| Guided: temporary DOM inspection 3, project setup 5, build/refresh loop 7 | 15 |
| Challenge: pointer 1; Task 1 (7), Task 2 (9), Task 3 (12), Task 4 (16) | 45 |
| Quiz, individual explanation and service-notice transfer | 15 |
| Feedback, recovery and saving a supported next step (protected) | 10 |

This is one challenge with a changed-input diagnosis, not four unrelated projects.

## Outcomes

1. **Describe** the roles of HTML, CSS, JavaScript and the DOM in the supplied page.
2. **Compare** TypeScript compilation with JavaScript execution in Node.js and the browser.
3. **Write** and run a small TypeScript change that updates a supplied DOM element reference.
4. **Debug** a compiler error and distinguish it from a runtime failure.

## What you own and what is supplied

Edit the value and assignment in `starter/src/main.ts`. Preserve the supplied import, lookup,
stylesheet, tests and compiler configuration. For the changed page, use one of the supplied
script-selection commands after recording your evidence; it changes the existing HTML attribute
without asking you to build a new page.

| File or directory | Responsibility | Your interaction |
|---|---|---|
| [`src/main.ts`](starter/src/main.ts) | TypeScript status text and assignment | Make the required text change and temporary fault correction |
| [`src/page.ts`](starter/src/page.ts) | Locate and check a paragraph, export its typed reference | Read its documented promise; leave implementation supplied |
| [`index.html`](starter/index.html), [`handover.html`](starter/handover.html) | Page structure and selected JavaScript URL | Inspect both; use the provided selection command when justified |
| [`style.css`](starter/style.css) | Appearance, readable layout and focus indication | Identify its role without redesigning it |
| `tsconfig.json`, `package*.json` | Pinned build and checks | Run the documented commands |
| `dist/` | Generated JavaScript | Inspect output; do not implement your fix here |
| `tests/`, `fixtures/`, `tools/` | Visible outcomes and controlled diagnosis support | Run and read them; no test authoring required |

`statusLabel` is an `HTMLParagraphElement`: a checked reference to the paragraph with id
`mission-label`. Its `textContent` property accepts text and changes the live paragraph. `page.ts`
stops with a diagnostic if the supplied markup no longer contains the expected paragraph. TypeScript
describes this reference during compilation; the browser creates the actual element when it parses
the page.

Other supplied files: `src/previous.ts` (the previous program, emitted as `dist/previous.js`),
`src/portable.ts` (the portable sample), `demos/inspection.html` with `src/demos/inspect.ts`
(Worked Example 1), [`demo-observations.md`](starter/demo-observations.md) (captured fallback), and
[`../checkpoint/main.ts`](checkpoint/main.ts) (recovery checkpoint).

## Concepts you will use

The supplied paragraph, its style rule, the program and the script element it is loaded by:

```html
<p id="mission-label" class="status">HTML only</p>
```

```css
p.status {
  font-size: 1.5rem;
  border-left: .4rem solid #204e79;
}
```

```ts
import { statusLabel } from "./page.js";
const labelText: string = "Tools connected";
statusLabel.textContent = labelText;
```

```html
<script type="module" src="dist/main.js"></script>
```

The `.js` spelling in the import is intentional: the browser loads emitted JavaScript, while
TypeScript resolves the corresponding source during compilation. `noEmitOnError` stops a failed build
from writing new output, but an earlier successful output can remain in `dist`.

## Prerequisites and tool versions

The prepared runtime uses Node 22.23.2, npm 10.9.8, TypeScript 5.9.3 and Playwright 1.61.0 with its
matching Chromium. Those are reproducibility pins, not a claim that each is the newest release.
(Any Node 22 or later works; the package pins TypeScript and Playwright exactly.) No BP credentials or
deployment are needed.

## Setup: use a fresh working copy

Open this lab in the editor, copy the entire `starter` directory to a writable working location, and
open that copy. Keep the supplied original for recovery. In its terminal, confirm that
`package.json`, `src` and `index.html` are visible. The following commands run inside that copied
starter, not the containing lab folder.

```bash
node --version
npm --version
npm ci
npx tsc --version
npx playwright install chromium
npm run check:baseline
```

`npm ci` uses the supplied lockfile; it requires package-registry access on the first install unless
the prepared environment has the dependencies cached. The browser-install command similarly needs
access or a prepared cache. Do not substitute floating dependency versions when installation is
blocked. Ask for the prepared package/cache or use the captured walkthrough while access is restored.

The baseline must pass two browser checks. It confirms that the page, styling, element lookup and
inspection demonstration work before your edit. It does not require the final ready message. Start the
interactive server in this terminal:

```bash
npm start
```

Open http://127.0.0.1:4311/. Leave that terminal running and open another terminal in the same working
folder for builds and checks. The server does not rebuild automatically. Stop it with Ctrl+C before
running the automated browser suite, because the suite starts its own server on that port. If another
task owns the port, use `PORT=4312 npm start` and `PORT=4312 npm test` (PowerShell:
`$env:PORT=4312; npm start`), then open the matching address.

## Guided practice (15 minutes)

1. **Temporary DOM change (3 min).** Open http://127.0.0.1:4311/demos/inspection.html. With a partner,
   change the inspection paragraph to *Temporary text* in Elements. Reload and observe its return to
   *Script loaded*. Explain why the returned text is neither your temporary value nor the HTML's
   initial label.
2. **Open the complete project (5 min).** Confirm `package.json` is visible in the terminal. *Activity:
   Type* — run the version commands and baseline check above; record whether the result is a working
   baseline, a package-install problem or an unavailable environment before editing.
3. **Build and refresh loop (7 min).** Run `npm run build`, then `npm start`, open the main page. Trace a
   harmless edit to the label, then restore its starting words: save, build and reload in that order.
   In the Network panel select `main.js` if old text persists.

## Lab challenge

### Task 1: establish the baseline (7 minutes)

Confirm the main page reads *Tools connected*, then find its `mission-label` paragraph in Elements and
`index.html`. The HTML's initial text is *HTML only*; explain which statement supplied the displayed
replacement. Identify the stylesheet rule responsible for the border, and record the main page's
requested JavaScript URL in [`evidence.md`](evidence.md) or equivalent notes.

Stop the interactive server and run `npm test` once on the unchanged starter. **Expect the two
ready-message checks to fail while the two baseline checks and the literal-text check pass** (3 passed,
2 failed). Read the expected and received strings. This controlled mismatch confirms what the challenge
asks you to implement; it is different from a browser installation failure or a failed baseline. Save
this first result, then restart the server if using the browser manually.

Pairs may share one working directory. The first operator runs the baseline; the observer identifies
the relevant element and execution location. Swap roles for the source edit. Each person keeps their
own prediction and explanation.

### Task 2: write and verify the ready message (9 minutes)

Change the TypeScript text in `src/main.ts` so the existing paragraph displays exactly **Ready to
explore**. Keep the reference and property assignment in place. Predict whether the edit changes the
HTML file, the generated JavaScript or the loaded DOM at each stage. Save, run `npm run build`, inspect
`dist/main.js`, and reload the main page.

Identify where `: string` disappeared and where the value remains. Record the changed element's id
rather than relying on its screen position. Editing only `index.html`, a browser inspector value or
`dist/main.js` does not satisfy the source-program requirement. Stop the interactive server and run
the focused check:

```bash
npx playwright test --grep "current label communicates"
```

This check does not run the compiler itself, so run it after your successful build. `npm test`
performs both build and the complete suite. The handover requirement remains outstanding at this stage.

### Task 3: correct a compiler fault and identify a runtime boundary (12 minutes)

Install the supplied one-fault case. It first copies your successful source to
`src/main.before-case.txt` and refuses to overwrite an existing backup. If a backup already exists,
preserve it under another name before retrying the case command.

```bash
npm run case:compile
npm run build
```

Predict the build result before reading the diagnostic. The temporary requirement is to display the
words *Checkpoint seven*, not the number 7. Record the diagnostic code, the assignment's declared type
and the supplied value's type. Correct `src/main.ts` against that requirement, build, reload and observe
the temporary message. Explain why changing the declared type to number would not meet the requested
text contract even if the first assignment became type-consistent.

Restore your own saved ready-message version and rebuild:

```bash
npm run case:restore
npm run build
npm run run:portable
npm run run:node
```

The portable sample prints *Tools ready* in the terminal. The final command is a deliberate negative
check: Node.js executes the browser-dependent program and reports that `document` is not defined.
Record its execution location and explain why recompilation cannot supply a document to that process.
The normal browser route must still show your restored message. Do not edit the supplied lookup to hide
the diagnostic or replace it with a fabricated document.

### Task 4: diagnose the changed handover page (16 minutes)

Start the server and visit `/handover.html` after confirming a successful build. The requirement is
that this page and the main page show the same current ready message. Both contain the expected
paragraph and load the supplied styling, yet the handover starts with a different displayed message.

* **First 4 minutes — prediction and evidence choice.** List two explanations compatible with an old
  message, choose one observation that distinguishes them, and state what each possible result would
  imply. Choose among reading compiler output, comparing the HTML script selections, inspecting
  delivered JavaScript in Network, or altering the CSS. Do this before running a script-selection
  command.
* **Middle 8 minutes — evidence and bounded correction.** `npm run page:current` selects the current
  program for the handover; `npm run page:previous` selects the supplied previous program. The command
  names are available controls, not evidence that either action is warranted. Establish which artifact
  the handover actually requests.
* **Final 4 minutes.** Reload both pages and run `npm test` with the interactive server stopped. **All
  five browser checks should pass.** Explain what would happen if the handover were changed back to
  the previous selection while the successful source and build remained untouched.

## Acceptance criteria

- [ ] The unchanged starter baseline passes before editing; expected challenge failures are
      distinguished from environment failures.
- [ ] `src/main.ts` contains the source change, compiles successfully and updates the supplied
      `mission-label` paragraph to the exact ready message.
- [ ] HTML structure and CSS remain supplied, and the emitted file is identified separately from the
      TypeScript source.
- [ ] The seeded compiler diagnostic is recorded, corrected to the temporary text requirement and
      followed by a successful restore of your own work.
- [ ] The portable Node sample succeeds; the page-program Node probe fails for the expected
      missing-document reason, which you explain.
- [ ] Both page paths meet the ready-message contract and the five browser checks pass after the
      diagnosed selection change.
- [ ] You record a prior prediction, a defended diagnostic choice, a changed-input counterexample and
      the original individual evidence check.

## Hints

**Hint 1: identify the boundary.** Separate the file you edited, the file compilation produced and the
file the browser requested. A successful observation at one boundary does not identify what occurred
at the next. Which of those three names is still uncertain in your evidence?

**Hint 2: expose an intermediate artifact.** Open Network, reload the affected page and select its
JavaScript response. Compare a distinctive message in that response with the corresponding saved
source. If the names or messages differ, record that mismatch before making an edit. If they agree,
investigate the actual DOM assignment and element instead.

**Hint 3: complete the explanation.** Fill this sentence using observations: "The build produced ___,
but this page requested ___. I expect changing ___ to affect ___ because ___." Then choose the
documented command or source correction that matches your evidence.

## Individual evidence and assistance

Use [`evidence.md`](evidence.md) to identify the element changed by the script and explain where
compilation and execution occurred. Show the source statement, emitted artifact and browser result,
plus the compiler and runtime diagnostics. An oral account, annotated trace or recording is equivalent
to written prose; each learner still supplies their own explanation and changed-context decision.

In the lesson's service-notice transfer (a notice page says "Open" although the saved TypeScript says
"Closed" and the build succeeded), choose a first diagnostic observation and explain a conditional next
step if the delivered script does or does not contain the expected message. Record docs/human
prompts/checkpoint use separately from artifact success: *demonstrated independently*, *demonstrated
with a prompt*, *completed with guided support*, or *not yet demonstrated*; mark *environment blocked*
separately. First attempts use the supplied material and human/access support without generated code.

## Knowledge check (about 8 minutes, self-check)

1. The saved HTML contains a paragraph reading "HTML only". After loading, the live paragraph says
   "Ready to explore" and retains its supplied border. Which explanation matches these observations?
2. A learner builds successfully, then runs the emitted page program using Node.js and receives
   "document is not defined". Which next action tests the intended behaviour?
3. The task requires a reproducible TypeScript update to the existing paragraph. Which change satisfies
   that requirement when followed by build and reload?
4. A temporary label must display "Checkpoint seven". The case contains `const labelText: string = 7;`
   and the compiler reports TS2322. Which correction meets the stated requirement without weakening
   the check?
5. A service notice is correct on one page and old on a second page after a zero-exit build. Which
   first comparison most directly tests whether both pages executed the same program?

Pick your answer before reviewing the options and feedback with the facilitator.

## Recovery and accessible alternatives

Preserve your attempted source before restoring the starting checkpoint. From inside your working
starter, the first command saves a separate attempt; use a fresh filename if it already exists:

```bash
cp src/main.ts src/main.attempt.txt
```

(PowerShell: `Copy-Item src/main.ts src/main.attempt.txt`.) Copy the lab's
[`checkpoint/main.ts`](checkpoint/main.ts) into the working copy's `src/main.ts` using the editor, run
`npm run page:previous`, then `npm run check:baseline`. This recovery restores the initial learning
state; it does not supply the handover diagnosis or count as independent completion.

The page uses text labels and semantic headings, supports browser zoom and requires no aiming, timing
or colour-only interpretation. Use keyboard-accessible navigation links, a partner-operated inspector,
or the captured source/page comparison in [`demo-observations.md`](starter/demo-observations.md). If
you cannot run the environment, use the captured trace for explanation and record the outstanding live
execution check.

## Teardown and optional depth

Stop a manually started server with Ctrl+C. The automated browser tests stop their own server; `dist`
and `test-results` are generated artifacts in your working copy. Keep source, backup and evidence
files for feedback, then close the terminals. No external service, credential or deployment was
created.

Optional (after all required evidence): compare the worked-example copy in
[`../../examples/w2-01/`](../../examples/w2-01/) with your own emitted output. It adds no requirement
to later sessions.

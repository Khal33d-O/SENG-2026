# W2.01 captured demonstration observations (fallback)

Author-captured evidence for when the browser inspector or the live build is unavailable. It records
what the facilitator observed; it does not demonstrate that **you** executed the change.

## Worked Example 1: inspection page

URL: `http://127.0.0.1:4311/demos/inspection.html`

Saved source (`demos/inspection.html`):

```html
<p id="inspection-label" class="status">HTML label</p>
<script type="module" src="../dist/demos/inspect.js"></script>
```

Live page (Elements panel after loading): heading "Inspect a page"; paragraph
`<p id="inspection-label" class="status">Script loaded</p>` with a solid left border.

Observation: View Page Source shows "HTML label"; Elements shows "Script loaded". The program
`src/demos/inspect.ts` (emitted as `dist/demos/inspect.js`) assigned the live text after parsing; the
border comes from the `p.status` rule in `style.css` and remains after the words change. Editing the
paragraph to "Temporary text" in Elements and reloading returns "Script loaded".

## Worked Example 2: compile a label update and correct its type

Source edit in the demonstration copy (`src/main.ts`): `const labelText: string = "Demo ready";`

Emitted file (`dist/main.js`) after `npm run build`:

```js
import { statusLabel } from "./page.js";
const labelText = "Demo ready";
statusLabel.textContent = labelText;
```

Browser result after reload: the `mission-label` paragraph reads "Demo ready".

Faulty edit `const labelText: string = 42;` then `npm run build`:

```text
src/main.ts(2,7): error TS2322: Type 'number' is not assignable to type 'string'.
```

The build exits non-zero and, because `noEmitOnError` is enabled, `dist/main.js` still contains the
previous "Demo ready" output, so the page keeps showing it after reload.

## Node execution probe

`npm run run:portable` prints `Tools ready` in the terminal. `npm run run:node` fails with
`ReferenceError: document is not defined` (raised in `dist/page.js` before the label assignment).

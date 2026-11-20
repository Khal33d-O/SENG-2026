# W2.01 worked examples

A runnable **demonstration copy** of the W2.01 starter, used by the facilitator so the learner's own
starter stays at "Tools connected".

| Path | Worked example |
|---|---|
| `demos/inspection.html`, `src/demos/inspect.ts` | Worked Example 1: inspect the supplied page and its label ("HTML label" in source, "Script loaded" live) |
| `src/main.ts` | Worked Example 2: the label changed from Tools connected to **Demo ready** |
| `type-error/main.ts` | Worked Example 2, second half: the unquoted number `42` kept with `: string` (copy over `src/main.ts` to reproduce TS2322) |
| `emitted/main.js`, `emitted/page.js` | Captured emitted JavaScript from `npm run build` (the annotation has disappeared) |
| `recovery/src/main.attempt.txt` | Example of a preserved attempt made with `cp src/main.ts src/main.attempt.txt` before restoring the checkpoint |

Run it (from this folder, in a scratch copy):

```bash
npm ci
npx playwright install chromium
npm start            # http://127.0.0.1:4311/  and  /demos/inspection.html
npm run build        # in a second terminal after each edit, then reload
npm run run:portable # Tools ready
npm run run:node     # ReferenceError: document is not defined
```

Expected: the main page shows "Demo ready"; `cp type-error/main.ts src/main.ts && npm run build` reports
`error TS2322: Type 'number' is not assignable to type 'string'.` and leaves the previous `dist/main.js`
in place. Restore with `git checkout` or by retyping the quoted text, then rebuild.

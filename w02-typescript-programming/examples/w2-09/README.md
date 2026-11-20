# W2.09 worked examples

Both worked examples are **complete pages inside the lab starter** (they need its web/collector process
and the supplied API):

```bash
cd ../../labs/w2-09/starter
npm ci
npx playwright install chromium
npm start        # http://127.0.0.1:4179/demo.html?mode=working
```

| Page / file | Worked example |
|---|---|
| `demo.html?mode=working` (`src/demo.ts`, copy here) | **Worked Example 1: follow one recorded reference action** — East from a fresh run, then the matching row in the Local event view |
| `demo.html?mode=mismatch`, then `?mode=repaired` | **Worked Example 2: repair the observed render argument** — pause on the `if (mode === 'mismatch')` branch in the served `dist/demo.js`, inspect `before.position.x`, `after.position.x`, `state.position.x`, `sequence`, `runId`; resume; compare the page with the event |
| `practice.html` (`src/practice.ts`, copy here) | Guided practice: the task counter using the same recorder |
| [`response.json`](response.json) | Captured body of `GET /api/boards/reference` from the supplied .NET API |
| [`demo-observations.md`](demo-observations.md) | Recorded walkthrough for a blocked live demonstration |
| `emitted/app.js`, `emitted/demo.js` | Captured `dist/app.js` (unchanged starter, with the seeded paint condition) and `dist/demo.js`: the files the browser actually executes |

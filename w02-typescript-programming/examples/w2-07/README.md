# W2.07 worked examples

```bash
npm ci
npm run demo:bare    # Worked Example 1, bare assertion
npm run demo:named   # Worked Example 1, the same claim as a named test
```

| File | Worked example |
|---|---|
| `test.mjs` | Runs both forms below in one command (`node test.mjs` after `npm run build`) |
| `demos/bare-assertion.mjs` | **Worked Example 1: move the familiar assertion into a named test** — the bare W2.03 assertion (setup, action, assertion) |
| `tests/conversion.test.mjs` | the same claim inside `test('converted assertion: excludes equality', ...)` |
| `src/conversion.ts`, `src/tile.ts`, `fixtures.mjs` | the complete conversion rule and supplied helpers (`demoTiles`, `ids`, `snapshot`) |
| `emitted/conversion.js` | captured `dist/conversion.js` (what the tests actually import) |
| [`demo-observations.md`](demo-observations.md) | **Worked Example 2: reproduce the seed and inspect its cause** — captured output from the lab starter |

Worked Example 2 runs inside the lab starter itself (`npm run check:regression`, `npm run inspect`,
then the one-character correction in `src/costly.ts`); its captured output is in `demo-observations.md`.

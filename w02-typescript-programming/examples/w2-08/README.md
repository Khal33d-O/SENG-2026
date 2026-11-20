# W2.08 worked examples

```bash
npm ci
npm run demo:compare
```

| File | Worked example |
|---|---|
| `src/demo-compare.ts` | **Worked Example 1: compare functions with one class instance** — the function adapter and `DemoComponent` each request East; then the scalar receiver example |
| `src/before.ts` | Original explicit-state functions (`createHolder`, `moveHolder`, `snapshotHolder`) and the compatible adapter |
| `src/demo-class.ts` | The complete demonstration class: `#state`, constructor with `copyState`, `move`, `snapshot` |
| `src/contract.ts` | `Component` interface and the bounded `copyState` helper |
| `src/receiver.ts` | `north` / `south` share one `describe` function: `this` comes from the call |
| `src/subscriber.ts` | The stored-operation caller used in the lab challenge |
| [`demo-observations.md`](demo-observations.md) | Captured output of both worked examples and the caller inspection |

**Worked Example 2: refactor and rerun the existing assertions** runs inside the lab starter
(`npm run demo:refactor`): the six shared assertions in `tests/shared.mjs` against the function adapter,
then against `DemoComponent`.

# W2.02 worked examples and concept snippets

Every code example from the W2.02 session as a runnable file (`src/*.ts`), compiled with the course's
TypeScript 5.9.3.

```bash
npm ci
npm run example            # build, then run all examples in turn
npm run example -- loop    # run one example
```

| File | Session section | Output |
|---|---|---|
| `values.ts` | What values and types does TypeScript use? | `4 31 false` |
| `inference.ts` | Infer a type from an initializer | `2` (replace `2` with `"two"` to see the diagnostic) |
| `object-literal.ts` | Object literals and property access | `4`, `7` |
| `object-type.ts` | Separate an object type from an object value | `2` |
| `demo-object.ts` | **Worked Example 1: Inspect a small game state** | `North gate 7 true`, `4` |
| `condition.ts` | Conditions | `Heating on` |
| `combined.ts` | Combine comparisons | `true` |
| `loop.ts` | Trace a counted loop | `6` |
| `demo-boundary.ts` | **Worked Example 2: Update a state with no remaining actions** | `4 0` (start from two for `6 1`) |
| `alias.ts` | Update a property through an alias | `true true` |
| `replace.ts` | Replace one reference | `South North`, `false` |
| `practice.ts` | Guided practice: packing loop | `12` |
| `printer.ts` | Knowledge check Question 3 (trace on paper first) | `printed is 1` |

`tsconfig.json` sets `moduleDetection: "force"` so each file is its own module and repeated names such
as `state` or `temperature` do not collide.

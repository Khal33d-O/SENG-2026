# W2.04 worked examples and concept snippets

```bash
npm ci
npm run example              # build, then run every example from dist/src/
npm run example -- models    # one example
```

| File | Session section | Output |
|---|---|---|
| `src/retrieve.ts` | Retrieve Monday's object and function | `2 1 false` |
| `src/counter.ts` | What are interfaces and simple union types? | `{ label: 'visits', value: 4 }` |
| `broken/wrong-counter.ts` | Describe a required property (not compiled; copy into `src/` to see `TS2741`) | compiler error |
| `src/switch.ts` | List alternatives with literal unions | `enable` |
| `src/models.ts` | **Worked Example 1: Model three states and an action union**, plus narrowing on `phase` | the three objects, `collect`, then `1` |
| `src/rule.ts`, `src/caller.ts` | What is a module? (`twice`) | `6` |
| `src/boundary.ts` | **Worked Example 2: Export, import and trace one transition** (`callRule`) | playing/0, complete/1, retained ready object |
| `src/ui/caller.ts`, `src/ui/rule.ts` | Knowledge check Question 4: `"../rule.js"` selects the parent module | `approved` |
| `emitted/src/…` | Captured emitted JavaScript (`dist/src/caller.js`, `dist/src/rule.js`, `dist/src/ui/caller.js`, `dist/src/ui/rule.js`) | — |

Inspect `emitted/src/caller.js`: the value import `./rule.js` remains; type imports and annotations have
gone. `src/rule.ts` holds `twice`, the Question 4 `origin` value and the ordinary state model so that
`boundary.ts` can use the book's exact import lines.

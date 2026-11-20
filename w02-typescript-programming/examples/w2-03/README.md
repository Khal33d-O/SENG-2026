# W2.03 worked examples and concept snippets

The session's code examples as runnable files (TypeScript 5.9.3, Node 22+).

```bash
npm ci
npm run example             # build and run all
npm run example -- checks   # Worked Examples 1 and 2 together
```

| File | Section | Output |
|---|---|---|
| `references.ts` | Two names reaching one object | `9` |
| `remaining.ts` | A function returns a value | `5` |
| `double.ts` | Passing one result to another call | `8 16` |
| `arrays.ts` | Index, length, push | `2 3 [ 2 ] [ 2, 5, 3 ]` |
| `captions.ts` | Map keyed replacement, plus the guided two-line edit | `Held 2`, then `Paused false 3` |
| `flags.ts` | `has` versus `get(...) === true` | `true false false` |
| `checks.ts` | **Worked Example 1** (`affordableLoop`) and **Worked Example 2** (`affordableFilter`) with the supplied assertions | both `[ 'amber', 'copper' ]`, `PASS loop and callback agree` |

Note on `captions.ts`: here `q` is a **new** key, so the size grows to 3. In the lab's `practice.mjs`
the caption Map already holds `p` and `q`, so the same two lines print `Paused false 2` — a useful
contrast between replacing and adding a key. The lab's own demos are in the starter
(`npm run demo:loop`, `npm run demo:filter`).

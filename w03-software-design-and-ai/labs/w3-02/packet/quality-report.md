# Quality report (ESLint 10.10.0, recorded local configuration)

**Scanned artifact:** the JavaScript emitted by TypeScript 5.9.3 (`tsc -p tsconfig.json`, target ES2022,
NodeNext modules) — *not* the TypeScript source. Reported lines and columns refer to emitted JavaScript.
These outputs were produced by actually running the commands on the supplied files (2026-10-11).

## Configuration (`eslint.config.mjs`)

```js
export default [
  {
    files: ["**/*.js"],
    languageOptions: { ecmaVersion: 2022, sourceType: "module" },
    rules: {
      "no-unused-vars": "error",
      "no-constant-condition": "error",
      complexity: ["warn", 12],
    },
  },
];
```

`no-unused-vars` and `no-constant-condition` are errors; `complexity` is a warning above 12. No rule encodes
the game's move-cost requirement, and no behaviour test is part of these commands.

## File fingerprints (SHA-256)

| File | SHA-256 |
|---|---|
| `src/candidate-c.ts` | `20d2a7100f2bd13d1be212e85fac29367f685628a675c0f57b5c93ad70870c25` |
| `dist/candidate-c.js` | `5fa0ad8532b705c3c92bc05c7e518bea50d6a88829769a03dcd7bd50dec3d3ff` |
| `src/reference.ts` | `e0b0143f36125260b4b51335ce0466f4e99de59e6603313296a87a3c5e14a050` |
| `dist/reference.js` | `ab0609d7ec4fc556f8900e234e711dfeb6dac37ee59a4cc2fa823466ed2ab144` |
| `src/tone.ts` | `0ab5486d20bdc96a0e8b43f967f0626b11bc338f3af86757f154ce2261ea0c65` |
| `dist/tone.js` | `fc4feb02b198de8c01b1129b82271c54a711cb291e8160cadc59729e758e246e` |

Emitted line 17 in both `dist/candidate-c.js` and `dist/reference.js` is
`export function evaluateMove(state, direction) {` — the TypeScript source expression
`export function evaluateMove(state: State, direction: Direction): MoveResult {`.

## Candidate C summary — ordinary command

```text
$ npx eslint dist/candidate-c.js
dist\candidate-c.js
  17:8  warning  Function 'evaluateMove' has a complexity of 14. Maximum allowed is 12  complexity

✖ 1 problem (0 errors, 1 warning)
(exit status 0)
```

## Reference summary — ordinary command

```text
$ npx eslint dist/reference.js
dist\reference.js
  17:8  warning  Function 'evaluateMove' has a complexity of 14. Maximum allowed is 12  complexity

✖ 1 problem (0 errors, 1 warning)
(exit status 0)
```

## Reference with a stricter command policy

```text
$ npx eslint --max-warnings 0 dist/reference.js
dist\reference.js
  17:8  warning  Function 'evaluateMove' has a complexity of 14. Maximum allowed is 12  complexity

✖ 1 problem (0 errors, 1 warning)

ESLint found too many warnings (maximum: 0).
(exit status 1)
```

The same warning; the `--max-warnings 0` option changes the command's acceptance policy, not the program.

# Three completion receipts for the same bugfix handoff

Each receipt reports a green count. Fingerprints are SHA-256 of file bytes (first 12 characters shown; full
values at the end). Recompute any of them yourself with `sha256sum FILE`, or
`python -c "import hashlib,sys; print(hashlib.sha256(open(sys.argv[1],'rb').read()).hexdigest())" FILE`.

| File | SHA-256 (first 12) |
|---|---|
| Supplied pre-fix `code/starter/src/rules.ts` | `9acae645cacb` |
| Supplied fixed `code/starter/tests/rules.test.mjs` | `98ef5e60a4d8` |
| Recorded demonstration edit `code/recorded/edited-rules.ts` | `ab729d8e0518` |
| Supplied unsupported candidate `code/candidates/unsupported.ts` | `e157af0edb50` |
| `document/receipts/receipt-C-rules.test.mjs` | `8a2f536a28f0` |

## Receipt A

| Field | Value |
|---|---|
| Claim | "Blocked moves fixed; 5 of 5 tests pass." |
| Tested rule fingerprint | `ab729d8e0518` |
| Tested test-file fingerprint | `98ef5e60a4d8` |
| Current rule fingerprint | `ab729d8e0518` |
| Changed files versus the starter | `src/rules.ts` |
| Result | 5 tests, 5 pass, 0 fail (independent `assist.py check`) |

## Receipt B

| Field | Value |
|---|---|
| Claim | "Fixed and tidied the move cost; 5 of 5 tests pass." |
| Tested rule fingerprint | `ab729d8e0518` |
| Tested test-file fingerprint | `98ef5e60a4d8` |
| Current rule fingerprint | `e157af0edb50` |
| Changed files versus the starter | `src/rules.ts` |
| Result | 5 tests, 5 pass, 0 fail (recorded before the last edit) |

## Receipt C

| Field | Value |
|---|---|
| Claim | "All edge cases handled; 5 of 5 tests pass." |
| Tested rule fingerprint | `e157af0edb50` |
| Tested test-file fingerprint | `8a2f536a28f0` |
| Current rule fingerprint | `e157af0edb50` |
| Changed files versus the starter | `src/rules.ts`, `tests/rules.test.mjs` |
| Result | 5 tests, 5 pass, 0 fail |

Full fingerprints: pre-fix rule `9acae645cacb44ccaa8bff4d1f36f68e6a103885f487a2d2d01e0d3ebd37aa14`; fixed tests
`98ef5e60a4d831f40243407f8a06bddbd9d8b4850046424482f1d16a99ddfb62`; recorded edit
`ab729d8e051836a7deb5fc388d4b4f73853d296bbb99defb4bc710c2df84ff58`; unsupported candidate
`e157af0edb5014425906185b1a82ac6dc1e2f1b69746da5ff138d60094282e51`; receipt C test file
`8a2f536a28f00b67df2b8873abefe8b629bd7e5a77e02f36c888bbec97882982`.

# W3.06 rubric

| Criterion | Meets | Not yet |
|---|---|---|
| Path | One check reaches opener, decoder, session and rule through `controlledResponses` | Mocks `openSession` or asserts only on the stub's JSON |
| Ownership observations | Accepted progress observed in session A; A observed again while B is alive after opening and after advancing B | Only one session, or sessions in separate processes |
| Stage results | current and valid-refactor pass; lost-state and shared-state fail by assertion | A broken stage passes, a valid stage fails, or failure is a compile/import error |
| Independent expectations | Positions/budgets from board facts, or a snapshot captured before the operation examined | Expected value produced by the same session later |
| Supplied bytes | Only `ownership.test.mjs` edited; fresh setup per check | Supplied session, rule, support or harness changed |
| Note | 180–300 words: contract, boundary, setup, actual command/results, limit, result table | "Tests pass" or claims about live storage / all sessions |
| Individual explanation | One assertion and what it adds beyond a direct rule test; how setup repeats | Explanation copied from a partner |

# W3.04 rubric

| Criterion | Meets |
|---|---|
| Defect stated first | Initial state, East then South, expected five moves — recorded before any assistance |
| Instruction | Relevant context, fixed behaviour, one editable file, allowed tools, stopping condition, completion evidence |
| Boundaries inspected | Prepared permissions read; actual actions or access blocker recorded |
| Scope | Diff stays within `src/rules.ts`; board and tests unchanged |
| Independent checks | Current-source `assist.py check` with fingerprints, or a clearly recorded blocker |
| Receipts | One justified acceptance; a specific diagnosis and minimum next action for each insufficient receipt |
| Individual explanation | Connects an assisted edit to its independent expectation and names an evidence limit |

## Hints

1. **Hint 1 — locate the evidence:** the instruction (`instruction.txt`), what the tool did (`events.jsonl`
   and the run status in `record.json`) and what the check executed (fingerprints in each check entry).
2. **Hint 2 — compare obligations:** for each receipt, does the tested rule fingerprint equal the current
   one? Is any fixed file in the changed-file list?
3. **Hint 3 — organise the decision:** accept only a receipt whose tested source is the current source, whose
   scope is `src/rules.ts` alone and whose checks are the unchanged fixed tests; for the others name the
   single next independent action and what a pass or fail would change.

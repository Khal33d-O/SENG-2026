# W3.02 staged hints

**Hint 1 — orient your reading.** Read `review-brief.md` before the diff. Box the requested change; underline
the promises that remain. Then read `candidate-C.diff` hunk by hunk and write, for each hunk, which promise it
touches.

**Hint 2 — organise the comparison.** In `trace-observations.md` T2, compare baseline and candidate row by row.
For each row write the contract-derived expectation yourself (start: six moves; accepted move −1; rejection 0;
t1 grants no moves). Where does the baseline first differ from your expectation? Where does the candidate?

**Hint 3 — a partly completed operation.** Row 2 of T2: baseline 5 → 4 on a rejected South; the request
requires 5 → 5. Row 3 (East onto t1): your expectation is ___ → ___; the candidate shows 5 → 5. Which line of
the diff produces that, and which promise does it contradict? You still choose the verdict and the
distinguishing verification.

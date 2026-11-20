# Feature note: session ownership (180–300 words plus the result table)

**Contract** (what a caller can rely on, as one checkable sentence):

**Boundary** (real components; the one controlled external response):

**Setup and assumptions** (fresh factories, lifetimes, what "repeatable" means here):

**Verification** (command, the check file, what each observation establishes):

| Stage | Expected | Actual result (from `make test`) | Assertion that decided it |
|---|---|---|---|
| current | pass | | |
| valid-refactor | pass | | |
| lost-state | fail | | |
| shared-state | fail | | |

**What a failure would mean** (accepted progress, retained state, decoding or external response?):

**Limits** (what this check does not establish, e.g. live storage, other rules):

**Assistance and any unresolved execution failure:**

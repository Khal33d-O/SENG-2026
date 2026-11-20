# Complete two-demonstration sequence (recorded run)

Recorded by the course author on 2026-10-11 (Git 2.49 on Windows; course pin Git 2.47.3). Hashes and paths
differ in every preparation — use your own output. `<run>` stands for the printed run directory.

## Demonstration 1: inspect the source before committing

```text
$ python3 review.py prepare demo                         -> <run>/state.json
$ python3 review.py git "$W305_STATE" source switch -c feature/familiar-fix
Switched to a new branch 'feature/familiar-fix'
$ python3 review.py state "$W305_STATE"
@base      0fa88f22375b89e9be005b92f9723e976acb6b64
[source] HEAD 0fa88f22375b...  feature/familiar-fix
    MM draft-notes.md
     M src/rules.ts
    ?? scratch.txt
$ python3 review.py git "$W305_STATE" source diff --cached
+- Staged: ask reviewer to check the edge case too.
$ python3 review.py git "$W305_STATE" source worktree add --detach @review @base
HEAD is now at 0fa88f2 Baseline: familiar game rule (known blocked-move defect)
$ python3 review.py check "$W305_STATE" review @base
✖ east then rejected south preserves the complete public state   (movesRemaining 4, expected 5)
recorded check-1  -> fail: wall/state regression
$ python3 review.py git "$W305_STATE" source commit -m "Preserve state when a move is rejected" -- src/rules.ts
[feature/familiar-fix 26746a9] Preserve state when a move is rejected
 1 file changed, 1 insertion(+), 2 deletions(-)
$ python3 review.py record "$W305_STATE" proposal source
@proposal = 26746a92f4dbef8b82d38bcc94b6bf9375c10ff2
$ python3 review.py git "$W305_STATE" review switch feature/familiar-fix
fatal: 'feature/familiar-fix' is already used by worktree at '<run>/source'
```

The source's uncommitted correction did not travel to the detached review; the staged note is still staged
after the path-limited commit.

## Demonstration 2: inspect and test the committed proposal

```text
$ python3 review.py git "$W305_STATE" review switch --detach @proposal
HEAD is now at 26746a9 Preserve state when a move is rejected
$ python3 review.py git "$W305_STATE" review diff --name-only @base @proposal
src/rules.ts
$ python3 review.py check "$W305_STATE" review @proposal
[review] HEAD 26746a92f4db... (detached HEAD), clean; compiling 7 tracked files
ℹ pass 2   ℹ fail 0
$ python3 review.py preserve "$W305_STATE"
SAME  source working draft-notes.md
SAME  source working scratch.txt
SAME  source staged draft-notes.md (exact bytes)
PASS unrelated work preserved
$ python3 review.py git "$W305_STATE" source status --short
MM draft-notes.md
?? scratch.txt
```

The result establishes the familiar wall-preservation behaviour for `src/rules.ts` at `26746a9` in the
review location; it is not evidence about every rule, a browser or a hosted integration.

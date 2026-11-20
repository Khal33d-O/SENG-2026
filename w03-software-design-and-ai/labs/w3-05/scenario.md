# W3.05 challenge scenario

After `python3 review.py prepare challenge`:

- `@base` is the defective baseline commit on `main`.
- **The requested proposal is `@proposal`**: the tip of `feature/familiar-fix`, one commit that corrects the
  blocked-move branch in `src/rules.ts`. Use the hash that `state` prints for your own preparation.
- The `source` location already has `feature/familiar-fix` checked out. It also holds unrelated work:
  `draft-notes.md` with staged text and a further working edit, and an untracked `scratch.txt`.
- An existing review location (`review`) is on branch `review/annotations`. That branch has one extra commit,
  a saved annotation `review-notes.md`, made on top of the proposal. Its working directory also has an
  untracked `loose-note.md` with a reviewer's question.

The expected behaviour is the familiar one: from the initial state, East then a rejected South keeps five
moves and every other public field.

**Teammate's suggestion:** "The review folder's tests already pass, so just test there. Or run
`git switch feature/familiar-fix` in the review folder, and if Git complains, clean it out with
`git clean -fd` first."

Evaluate that shortcut against the actual state: which reference is the PR head, what the review branch was
created to retain, what a forced cleanup would destroy, and why a second checkout of the occupied branch is
refused and unnecessary.

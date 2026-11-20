# Complete local PR example (from the recorded demonstration)

**Status: local draft.** No hosted pull request exists, no peer has reviewed it and nothing is approved for
merge.

**Title:** Preserve state when a move is rejected

**Defect.** From the initial state (0,0) with six moves, East is accepted (five moves). South targets the
wall at (1,1) and is rejected, but the baseline `0fa88f2` returned four moves. The contract requires a
rejected action to preserve every public state field, so five moves.

**Correction.** The blocked branch of `evaluateMove` now returns the caller's state unchanged with
`accepted: false` and reason `ILLEGAL_ACTION`. Accepted moves still cost one.

**Scope.** `git diff --name-only 0fa88f2 26746a9` lists exactly one file: `src/rules.ts`
(1 insertion, 2 deletions). The planning note `draft-notes.md` (staged and working edits) and `scratch.txt`
remained uncommitted in the source location.

**Verification.** In the clean detached review location `<run>/review` at `26746a9`, the bound check
compiled the tracked files and ran the unchanged wall/state regression: 2 pass, 0 fail. The same check at the
baseline had failed (four moves instead of five). `preserve` reported the source's working note, staged note
bytes and scratch file unchanged.

**Limits.** These checks cover the familiar wall preservation and accepted-move cost for these files. They
do not establish every game rule, browser behaviour or integration.

**Next step.** Open a hosted pull request in an authorised environment and request peer review; attach the
full diff and the retained command output from `<run>/evidence/`.

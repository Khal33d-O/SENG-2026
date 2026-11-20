# W3.05 · Isolating and reviewing AI-assisted changes

**Duration:** about 120 minutes, including one 45-minute document challenge and an 8-minute knowledge check.

A review needs identifiable proposed files and a place to inspect them without mixing another task's work.
Branches and linked worktrees provide different parts of that arrangement. They do not decide whether the
proposed behaviour is correct.

## Outcomes

- Explain how branches and worktrees help isolate development and review work.
- Compare the working files in the demonstrated feature and review locations.
- Review the familiar bugfix in an isolated branch or guided worktree without mixing changes.
- Write a pull request that identifies the defect, the correction and its verification.

## Supplied and owned

| Path | Role |
|---|---|
| `assets/review.py` | Helper: `prepare`, `state`, `git`, `record`, `check`, `preserve`, `save-note` (prints every actual Git command) |
| `assets/fixture/` | Code and notes that `prepare` commits into a **new disposable repository** (`src/rules.ts`, `draft-notes.md`, tests) |
| [`command-guide.md`](command-guide.md) | Supplied command forms (detached and named-branch routes) |
| [`scenario.md`](scenario.md) | Challenge scenario and the teammate's shortcut |
| [`demo-record.md`](demo-record.md), [`local-pr-example.md`](local-pr-example.md) | Complete two-demonstration sequence and the complete local PR example |
| [`pr-record.md`](pr-record.md) | **You own:** the local PR record (250–450 words + evidence table + retained output) |
| [`criteria.md`](criteria.md), [`hints.md`](hints.md) | Acceptance criteria and staged hints |

No remote, hosted repository, account or model call is needed. The helper only operates inside the
repository it creates under `~/academy-w305-runs/` (outside the course folder; override with `W305_RUNS`); never reset or clean the shared course repository.

## Setup

Git 2.47.3 (or later), Node 22.23.2, Python 3 and TypeScript 5.9.3. In a working copy of the `assets` folder
run `npm ci` once (installs the pinned compiler used by the bound check). Use `python3` on macOS/Linux and
`python` on Windows. In PowerShell assign the state path with
`$env:W305_STATE = python review.py prepare demo` and pass `"$env:W305_STATE"`.

## Retrieve and predict

Start with six moves, move east to leave five, then attempt south into the wall: rejection must preserve
five and the other public state fields. **Predict:** the source directory contains an uncommitted correction
that passes the local check; the feature branch still points to the defective baseline. A colleague creates a
detached worktree at that baseline commit. Will its rule contain the correction? Name the observation that
could confirm your prediction.

## Concepts

A working tree contains checked-out files; the index holds the proposed next committed versions; HEAD
identifies the current checkout. A linked worktree has its own working files, index and HEAD while sharing
repository objects and ordinary branch references:

```
Shared objects and branch references
    |
```

```
source: HEAD + index + files
```

(review: HEAD + index + files — a second location with its own HEAD and index.) Plain `git diff` compares
working tracked files with the index; `git diff --cached` compares staged content with HEAD;
`git diff BASE PROPOSAL` compares committed endpoints. Status also reveals untracked files.

## Worked example 1: inspect the source before committing

From the `assets` directory, prepare the disposable demo and create the feature branch:

```bash
W305_STATE=$(python3 review.py prepare demo)
python3 review.py git "$W305_STATE" source switch -c feature/familiar-fix
python3 review.py state "$W305_STATE"
```

Inspect the plain and cached diffs (`python3 review.py git "$W305_STATE" source diff` and
`... source diff --cached`). The planning note `draft-notes.md` has staged text and further working changes
(`MM`); `scratch.txt` is untracked (`??`); `src/rules.ts` carries the uncommitted correction. Create the
separate review at the explicit baseline and execute the bound check:

```bash
python3 review.py git "$W305_STATE" source worktree add --detach @review @base
python3 review.py check "$W305_STATE" review @base
```

The check fails at the known wall assertion (four instead of five): the committed baseline was selected, so
the uncommitted correction did not travel with it. Complete the sequence by committing only `src/rules.ts`,
recording the proposal and observing Git's refusal to check out the occupied feature branch elsewhere:

```bash
python3 review.py git "$W305_STATE" source commit -m "Preserve state when a move is rejected" -- src/rules.ts
python3 review.py record "$W305_STATE" proposal source
python3 review.py git "$W305_STATE" review switch feature/familiar-fix     # refused: branch already used by a worktree
```

## Worked example 2: inspect and test the committed proposal

```bash
python3 review.py git "$W305_STATE" review switch --detach @proposal
python3 review.py git "$W305_STATE" review diff --name-only @base @proposal
python3 review.py git "$W305_STATE" review diff @base @proposal
```

The complete file list is `src/rules.ts`. Then run the bound check and the preservation check:

```bash
python3 review.py check "$W305_STATE" review @proposal
python3 review.py preserve "$W305_STATE"
```

Compilation and the unchanged wall/state regression pass, and the unrelated working and staged content
remains unchanged. The verification establishes the familiar wall-preservation behaviour for those files at
that revision and location — not every game rule or a hosted integration. The complete local PR account is
in [`local-pr-example.md`](local-pr-example.md): it is a local draft, with no hosted PR or peer approval yet.

## Guided practice

1. **Interpret the two status columns.** `MM`: the first column reports the index against HEAD, the second
   the working file against the index. Which comparison shows the staged note, which shows the extra working
   text, and would an ordinary tracked diff account for the scratch file?
2. **Distinguish a reference from a location.** A named feature reference can advance when a commit is made
   elsewhere; a detached review stays at its selected commit. Which observation shows whether a review HEAD
   and the requested proposal identify the same commit? What does a clean status add?
3. **Keep the proposed file set visible.** Inspect the complete committed file list before a path-filtered diff.
4. **Preservation versus matching labels.** Two `MM draft-notes.md` lines can hide different content; the
   preservation check compares hashes and exact staged bytes, including trailing whitespace.

## Lab challenge: review the proposal while preserving other work (45 minutes)

From a working copy of the supplied assets folder:

```bash
W305_STATE=$(python3 review.py prepare challenge)
python3 review.py state "$W305_STATE"
```

1. **Identify the requested proposal — 5 min.** Read [`scenario.md`](scenario.md). Record `@base` and
   `@proposal`; map `source` and `review` to their actual HEAD and branch; state where the staged note,
   further working edit and untracked files live — each claim from a command result.
2. **Inspect the comparisons — 8 min.** Worktree list, short status, source working diff, source cached
   diff, then the complete `@base`→`@proposal` file list and detailed diff; compare with the review branch's
   committed file list (`review diff --name-only @base review/annotations`). Do not filter to the rule file first.
3. **Choose and establish the review location — 12 min.** Write a prediction first (which HEAD or reference
   changes, which index stays separate, where the review note remains). Choose a route from
   [`command-guide.md`](command-guide.md): a fresh location, or a verified `save-note` before reusing the
   existing review. Explain why a second checkout of the occupied feature branch or forced cleanup is
   unnecessary. Classify any refusal before the next action.
4. **Verify and draft the PR — 12 min.** `check` the selected location at `@proposal`, then `preserve`.
   Copy the actual revision, location, complete file list and results into [`pr-record.md`](pr-record.md).
5. **Handoff and individual explanation — 8 min.** 250–450 words plus the evidence table and retained output;
   one actual Git-state observation explained individually.

Acceptance criteria: [`criteria.md`](criteria.md). Hints: [`hints.md`](hints.md).

## Knowledge check (8 minutes)

1. A developer has corrected the rule locally but has not committed it. They create a branch at HEAD and a
   detached worktree at that same committed revision. What should the reviewer expect? A) The new branch name
   causes Git to include the developer's current working edits. B) The detached worktree contains the selected
   committed state, so it may still contain the defect. C) The detached worktree shares the source index, so
   the staged correction is immediately available. D) A detached worktree cannot run a regression until it has
   a branch name.
2. In the source location, status shows `MM draft-notes.md`. The reviewer wants the difference between the
   staged note and its committed HEAD version. Which comparison answers that? A) `git diff`, because it always
   shows every change since the last commit. B) `git worktree list`. C) `git diff --cached`, because it compares
   the index with HEAD by default. D) `git diff BASE PROPOSAL`, because committed endpoints include all unstaged notes.
3. The requested proposal is committed. A local check passes in the source location after someone adds an
   uncommitted repair. The separate review is clean at the requested proposal but untested. Which action
   supports the requested review? A) Compile and run the unchanged check in the identified review location,
   recording its actual HEAD and result. B) Attach the source-directory pass to the proposal. C) Copy the local
   repair into the review and describe its pass as a test of the original proposal. D) Treat the clean review
   status as enough evidence.
4. The exact clean proposal passed the supplied wall/state check and preservation comparison. No hosted PR
   was opened. Which closing statement accurately supports the next step? A) The correction is approved and
   ready to merge. B) All game behavior is verified. C) This local draft names the defect, correction, full file
   set, tested revision/location and bounded result; hosted submission and review remain to do. D) The
   directory was isolated, so the reviewer does not need the diff or independent expectation.

## Recovery

Keep the document, outer evidence path (`<run>/evidence/`, printed by `state`) and any refusal before preparing
another fixture; each preparation creates a separate directory (`~/academy-w305-runs/demo1`, `.../challenge2`, ...). Use
`save-note` when your route needs the loose note moved. Avoid force removal, reset or clean: normal worktree
removal refuses modified or untracked work, and that refusal calls for preservation, not a stronger command.
A missing compiler is an environment problem; a branch already used by a worktree is a Git-state constraint;
a different HEAD is an attribution problem; an assertion failure means the selected source did not meet
the checked expectation.

## Optional: resolving a small conflict

Consider two branches that edit the same explanatory sentence differently. Which evidence would justify a
resolution and what should be checked afterwards? No merge or conflict creation is required.

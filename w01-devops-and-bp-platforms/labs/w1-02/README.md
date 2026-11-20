# W1.02 lab: Record the approved change and recover one file

## Scenario

You are preparing text used alongside the supplied reference board. The approved display label is
`Board label: Reference treasure hunt`. A later request proposes a Friday label, but it is still a draft. An unrelated
session note also needs to remain a draft. The current instructions name the wrong board; history contains the
required instruction `Choose Reference treasure hunt.` followed by `Use the Load board button.`

Record exactly one new local commit that changes only the display label to its approved wording. Preserve both
later drafts in your working files. Recover the correct instructions into the working tree without recording that
recovery in the new commit. Keep the local origin unchanged. The unusual final state is deliberate: you must explain
which version is committed and which is merely present on disk.

## Timing and deliverables

| Block | Minutes |
|---|---|
| Guided practice: setup and Tasks 1–2 | 15 |
| Challenge: readiness 3, Task 3 7, Task 4 12, Task 5 13, Task 6 10 | 45 |
| Quiz, individual evidence and transfer | 15 |
| Recovery and consolidation | 10 |

Submit your disposable practice repository and a completed copy of [`evidence.md`](evidence.md), kept **outside**
that repository. The document brief and rubric are in [`document/`](document/). Pairs may share a clone and rotate
operator/reviewer roles, but each learner supplies an individual explanation (oral, annotated or recorded responses
are equivalent). Use supplied documentation, human guidance and access support without generated answers for the
first core attempt and all individual checks; record any prompts or checkpoint help.

## Outcomes

* Describe the working tree, staging area, commits and remote repository.
* Explain how commit history supports investigation and recovery.
* Write Git commands to clone a repository, inspect a diff and commit a small change.
* Restore an earlier version of a sample file and verify its contents.

## Supplied and owned

* Supplied (do not edit): [`code/starter/prepare.py`](code/starter/prepare.py) (initializer: seed history and the
  local bare `origin.git`; refuses an existing destination), [`code/starter/configure.py`](code/starter/configure.py)
  (synthetic identity, hooks and signing disabled, in this clone only), [`code/starter/late_draft.py`](code/starter/late_draft.py),
  [`code/starter/test_state.py`](code/starter/test_state.py) (baseline and semantic acceptance checker),
  `code/starter/fixture.py` (shared values). [`starter/`](starter/) is a convenience alias for `code/starter`; there is
  one set of scripts, not two versions to edit.
* You own: the commands you choose inside `practice`, and your evidence record.

## Prerequisites

Linux terminal (or Git Bash), Git and Python 3. The scripts were executed with Git 2.47.3 and Python 3.13.5 in the
book's rehearsal and re-tested with Git 2.49 / Python 3.13 when these materials were built. No package download,
account, server or global configuration change is required.

## Setup

Open a terminal in this lab's directory (the one containing this README). `LAB_PACK` remembers it; `LAB_WORK` names a
new disposable workspace outside the course checkout. If that folder already exists, choose another name.

```bash
LAB_PACK="$PWD"
LAB_WORK="$HOME/w1-02-work"
export GIT_CONFIG_NOSYSTEM=1
export GIT_CONFIG_GLOBAL=/dev/null
export GIT_PAGER=cat
export PYTHONDONTWRITEBYTECODE=1
python3 "$LAB_PACK/code/starter/prepare.py" "$LAB_WORK"
cd "$LAB_WORK"
ls
```

## Worked examples

The instructor demonstrates cloning, status columns, diffs, a small commit and a bounded restore with `welcome.txt`:
see [`../../examples/w1-02/README.md`](../../examples/w1-02/README.md).

## Task 1: Clone and establish the baseline

```bash
git clone --no-hardlinks origin.git practice
cd practice
python3 "$LAB_PACK/code/starter/configure.py" "$PWD"
pwd
ls
git status
git remote -v
git rev-parse HEAD
python3 "$LAB_PACK/code/starter/test_state.py" "$PWD" --baseline
```

Expect the files `display.txt`, `instructions.txt` and `notes.txt`, a clean working tree and a baseline PASS.
Record the starting commit identifier and local origin path in your evidence. The acceptance checker without
`--baseline` is expected to **fail** at this stage because you have not made the requested change or recovery.

## Task 2: Prepare the approved label

Open `display.txt` inside `practice`, replace its one line with `Board label: Reference treasure hunt` (keep a final
newline) and save. Predict which status column will change, then:

```bash
git status --short
```

```bash
git diff -- display.txt
git add -- display.txt
git diff --cached -- display.txt
git diff -- display.txt
```

Explain why the cached diff shows the label change while the ordinary diff is empty. Write a prediction: "If I use an
ordinary commit now, its display.txt will contain ...". **Do not commit yet.**

## Task 3: Introduce and inspect the late request

```bash
python3 "$LAB_PACK/code/starter/late_draft.py" "$PWD"
git status --short
git diff --cached
git diff
git show :display.txt
cat display.txt
cat notes.txt
```

Explain the two status columns for `display.txt`. Record the staged contents and the different working contents
before making another mutation.

<details><summary>Hint 1: locate the competing versions</summary>

Read `git show :display.txt` and `cat display.txt` as observations of different places. Match each place to a column
in short status. Write the two actual lines before choosing any command that changes the index or history.
</details>

## Task 4: Make and defend a commit decision

Choose a command sequence that records the approved label in exactly one new local commit while preserving the later
display draft and session note on disk. Before running it, write your selected action, its predicted committed
content and the evidence supporting that prediction, plus one plausible alternative that would violate the request.
Afterwards inspect the new commit's changed paths and its `display.txt`, then the working files. A clean status is
not the goal: the two drafts should remain unstaged.

<details><summary>Hint 2: compare the selection with the request</summary>

Name the versions shown by the ordinary diff and the cached diff. Decide which version contains the approved label.
Then check how your proposed commit form selects its content. A later save need not replace an earlier staged choice.
</details>

## Task 5: Investigate and recover the instructions

Inspect the history of `instructions.txt` and the file contents at candidate commits. Record the identifier and
contents of the candidate you choose, and a rejected candidate with the content that made it unsuitable. Use a
file-scoped restore (`git restore --source=COMMIT --worktree -- instructions.txt`, with `COMMIT` from your own log) to
copy the chosen version into the working tree only. Do not stage or commit the recovered instructions.

<details><summary>Hint 3: select contents rather than a position in the log</summary>

Use `git log --oneline -- instructions.txt` to find relevant candidates and `git show IDENTIFIER:instructions.txt` to
inspect each. Replace `IDENTIFIER` with a value from your own log. The nearest parent is not a guarantee of correct
instructions. Choose the source before applying the restore form shown in the module.
</details>

## Task 6: Verify and explain the final state

```bash
python3 "$LAB_PACK/code/starter/test_state.py" "$PWD"
git show --stat HEAD
git show HEAD:display.txt
git show HEAD:instructions.txt
git diff --cached
git diff --name-only
git rev-parse HEAD
git rev-parse origin/main
git -C "$LAB_WORK/origin.git" rev-parse refs/heads/main
```

The checker reads committed objects, index differences, working contents and the local origin. Its PASS is
corroboration; your explanation must identify which edits are committed and which remain only in working files.

## Acceptance criteria

- [ ] The clone comes from the supplied local bare origin; the baseline passed before edits.
- [ ] Exactly one new local commit changes only `display.txt` to the approved reference label.
- [ ] The later Friday label remains in the working `display.txt`, and the session draft remains in working `notes.txt`.
- [ ] The new commit excludes the session draft and the instruction recovery; the index matches that commit after completion.
- [ ] Working `instructions.txt` contains the required reference-board instructions recovered from an inspected earlier commit.
- [ ] The actual bare origin and `origin/main` still identify the supplied starting commit.
- [ ] The semantic checker passes, and the evidence document explains the commit choice, rejected alternative, recovery source and remaining edits.

## Individual evidence: explain your commit and remaining edits

Using your own repository, identify the recorded `display.txt` contents and the current working contents. Explain
which edits are in the new commit and which remain only in the working tree. Name the evidence that shows the recovery
did not change the current commit or publish anything to origin. Use a committed-content observation, a
working-content observation and a remote comparison. If your lab is unfinished, use the instructor's captured
evidence and say so.

## Transfer to an equipment service

An equipment service keeps `opening-hours.txt` and `maintenance-notes.txt` in Git. An approved change to opening hours
is staged. A later experimental time exists only in the working file, and an unrelated maintenance note is also
unstaged. The previous two commits both contain a mistaken contact number in `help.txt`; an older version contains the
approved number. Explain how you would record only the approved hours, retain both drafts and recover the approved
help text, and the evidence you would inspect before and after each mutation.

## Knowledge check (8 minutes, formative)

1. `HEAD:label.txt` contains Morning, `:label.txt` contains Afternoon, and the working file contains Evening. You run only `git commit -m "Adjust label"`. What is the expected result?
   A. The commit contains Evening, because Git always records the latest saved file.
   B. The commit contains Afternoon, and the working file remains Evening.
   C. The commit contains Morning, because editing a tracked file cannot change a commit.
   D. The commit updates the origin and changes every copy to Afternoon.
2. You edit a tracked file, save it and stage it. You make no further edit. Plain `git diff` is empty, while `git diff --cached` shows your change. Which explanation matches the evidence?
   A. Staging deleted the edit from every version.
   B. Git has already published a commit to the remote.
   C. The working tree matches the index, and the index differs from the current commit.
   D. The empty diff proves the application passes its tests.
3. The current help file has the wrong contact number. The previous commit contains the same wrong number. An older commit contains the approved number. Which recovery plan is best supported?
   A. Restore from the nearest parent because earlier always means correct.
   B. Inspect the older file, restore only that working path from the suitable commit and verify its contents and preserved drafts.
   C. Replace every working file with the oldest repository snapshot without inspecting unrelated changes.
   D. Copy the newest commit message into the help file because the message certifies the content.
4. After cloning a supplied local bare origin, you make one commit in your clone. No one changes the origin and no publication command runs. Your local HEAD is new while `origin/main` still shows the starting identifier. Which statement is accurate?
   A. The new commit is local; a direct read of the bare origin can confirm it still has the starting branch value.
   B. The word origin means `origin/main` queries the other repository live on every read.
   C. The local commit failed because the remote-tracking identifier did not change.
   D. Making a local commit necessarily updates the running application.
5. You restore `help.txt` with an explicit historical source and `--worktree`. Which evidence best proves a bounded recovery while retaining an unrelated notes draft?
   A. The terminal printed no error, so all intended contents must be correct.
   B. Only the commit message, because it describes the file's meaning.
   C. A clean status, obtained by staging and committing every modified file.
   D. The recovered file matches the inspected source, the current commit's help file is unchanged, and the notes draft remains on disk.

## Recovery and teardown

If a restore produced the wrong instructions, inspect another candidate and restore only that file again. If an
incorrect commit included drafts, keep the attempt and start a fresh workspace with a different name (the initializer
refuses existing destinations); compare the two results. No whole-repository reset is required. If the terminal is
unavailable, use the instructor's captured transcript and mark the work as captured evidence.

Keep the workspace until evidence has been reviewed. Afterwards remove only that named disposable folder. Do not remove
the course checkout, alter a shared repository or publish this exercise. There are no background services to stop.

## Optional depth

When you finish early, compare your first prediction with your actual committed contents and explain a plausible
command that would have selected the wrong content (for example `git commit -a`, or `git add .` before committing).

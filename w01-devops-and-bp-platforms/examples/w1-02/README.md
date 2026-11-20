# W1.02 worked examples: clone, commit and restore the welcome file

Instructor demonstration files. Run in a disposable folder outside the course checkout. Tested 2026-10-10 with
Git 2.49 and Python 3.13 (the book's rehearsal used Git 2.47.3 and Python 3.13.5).

```bash
export GIT_CONFIG_NOSYSTEM=1
export GIT_CONFIG_GLOBAL=/dev/null
export GIT_PAGER=cat
python3 setup_demo.py "$HOME/w1-02-demo"
cd "$HOME/w1-02-demo"
```

## Worked Example 1: Clone and inspect the starter project

```bash
pwd
ls
git clone --no-hardlinks origin.git practice
cd practice
ls
git status
git remote -v
```

Expected: `practice` contains `welcome.txt`; status is clean on branch `main`; `git remote -v` names the local
`origin.git` path for fetch and push. Then set a synthetic identity in this clone only:

```bash
git config --local user.name learner-a
git config --local user.email learner@example.invalid
```

Status columns and the three comparisons:

```bash
git diff -- welcome.txt
git diff --cached -- welcome.txt
git diff HEAD -- welcome.txt
```

Record a small local commit (after editing and staging):

```bash
git diff --cached
git commit -m "Clarify the workshop welcome"
git show --stat HEAD
git show HEAD:welcome.txt
```

Inspect history before choosing a recovery source:

```bash
git log --oneline
git log --oneline -- welcome.txt
git show HEAD:welcome.txt
git show HEAD~1:welcome.txt
```

## Worked Example 2: Commit and restore the welcome file

Change `welcome.txt` to `Welcome to the workshop team.` and save it, then:

```bash
git diff -- welcome.txt
git add -- welcome.txt
git diff --cached -- welcome.txt
git commit -m "Clarify the workshop welcome"
git log --oneline -- welcome.txt
git show HEAD~1:welcome.txt
git restore --source=HEAD~1 --worktree -- welcome.txt
cat welcome.txt
git diff -- welcome.txt
git show HEAD:welcome.txt
```

Expected: `cat welcome.txt` prints `Welcome to the workshop.`; the post-restore `git diff -- welcome.txt` removes
the team wording and adds the recovered wording; `git show HEAD:welcome.txt` still prints the team wording. No other
file or origin is changed.

## Guided practice: explain an unfamiliar state (`hours.txt`)

```bash
python3 hours_state.py "$HOME/w1-02-hours"
cd "$HOME/w1-02-hours"
git show HEAD:hours.txt
git show :hours.txt
cat hours.txt
```

Predict what `git commit -m "Adjust opening time"` records (the indexed `Open 09:30`) and what the working file
contains afterwards (`Open 10:00`) before running it.

## Scenario files

[`scenario-files/`](scenario-files/) holds the small text files named in the guided practice, knowledge check and
transfer task (`welcome.txt`, `hours.txt`, `label.txt`, `help.txt`, `draft.txt`, `opening-hours.txt`,
`maintenance-notes.txt`). They are reading fixtures for discussion; the contact number is a synthetic placeholder.

Teardown: remove only the two disposable demo folders you created.

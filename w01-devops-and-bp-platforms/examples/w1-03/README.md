# W1.03 worked examples: open, check, review and update a configuration proposal

Instructor demonstration. Run from the lab folder `../../labs/w1-03/` (a personal copy). Tested 2026-10-10 with
Git 2.49 and Python 3.13. On Windows keep workspace paths short (Git can hit the 260-character path limit).

## Opening retrieval (`notice.txt`)

```bash
python3 retrieve_notice.py "$HOME/w1-03-retrieve"
cd "$HOME/w1-03-retrieve"
git show HEAD:notice.txt
cat notice.txt
```

The commit contains the staged line (`Workshop starts at 09:30.`); the working file still contains the later draft.

## Concepts referenced in the demonstration

Create a branch without moving main:

```bash
git status
git branch --show-current
git switch -c change/notice
git branch --show-current
```

The prepared configuration fields (`configuration/service.ini`):

```ini
[deployment]
notice = Welcome to the workshop.
replicas = 1
environment = training
```

Compare the complete proposed diff:

```bash
git diff -- service.ini
git diff --cached -- service.ini
git diff main HEAD
```

## Worked Example 1: Open a configuration proposal

Create a fresh demo workspace (request: change the notice to `Workshop starts at 09:30.`):

```bash
LAB_DIR="$PWD"
LAB_WORK="$PWD/../w1-03-demo"
export PYTHONDONTWRITEBYTECODE=1
python3 "$LAB_DIR/code/training.py" init --dest "$LAB_WORK" --scenario demo
python3 "$LAB_DIR/code/training.py" baseline --workspace "$LAB_WORK"
```

```bash
cd "$LAB_WORK/configuration"
git switch -c change/notice
git branch --show-current
```

Change only the notice in `service.ini`, save, inspect `git diff`, then commit and publish to the local bare origin:

```bash
git add -- service.ini
git diff --cached
git commit -m "State the workshop start time"
git push -u origin change/notice
```

Copy the description form (it vaguely says checks will follow) and open the proposal:

```bash
cp "$LAB_DIR/document/description-template.md" "$LAB_WORK/description.md"
```

```bash
python3 "$LAB_DIR/code/training.py" open \
  --workspace "$LAB_WORK" --branch change/notice \
  --description "$LAB_WORK/description.md"
python3 "$LAB_DIR/code/training.py" show --workspace "$LAB_WORK"
```

Expected: `LOCAL PR TRAINING` banner, base = main's starting commit, head = the new commit, the one-line diff; no
passing check or approval yet; main unchanged.

## Worked Example 2: Check, review and incorporate feedback

Write `$LAB_WORK/review.md` from `document/comment-form.md` (ask how the notice was verified, warn against implying
deployment), then:

```bash
python3 "$LAB_DIR/code/training.py" check --workspace "$LAB_WORK"
python3 "$LAB_DIR/code/training.py" review \
  --workspace "$LAB_WORK" --reviewer learner-b \
  --path service.ini --line 2 \
  --comment "$LAB_WORK/review.md" --decision comment
```

Expected check output: `Preview notice: Workshop starts at 09:30.` and `Planned replicas: 1 ...` with the full head.
The author revises `description.md` (preview observation + no-deployment limit) and runs `update` with the same
branch/description arguments as `open`; the head and its passing check are unchanged because only the description
changed. The reviewer then records `--decision approve` against line 2 with an updated comment.

## Supplied files for reference

[`supplied-files/`](supplied-files/) contains copies of what `init` writes: `preview.py` (the supplied program),
the two repository READMEs (`application/README.md`, `configuration/README.md`) and the retrieval `notice.txt`.

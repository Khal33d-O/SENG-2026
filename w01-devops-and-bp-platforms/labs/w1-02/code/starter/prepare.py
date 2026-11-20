"""Create the disposable W1.02 workspace with a seeded local bare origin.

Usage:  python3 prepare.py DESTINATION

DESTINATION must not exist yet. The script creates:

  DESTINATION/origin.git          bare repository whose main branch has a short history
  DESTINATION/fixture-start.json  the recorded starting commit (used by test_state.py)

It does not clone, configure or commit anything for you: those are your tasks.
"""

import sys

sys.dont_write_bytecode = True  # set before importing the sibling module

import json
import time
from datetime import datetime, timezone
from pathlib import Path

import fixture
from fixture import git

LAB_ROOT = Path(__file__).resolve().parents[2]  # .../labs/w1-02


def make_commit(origin, tree_entries, parent, message, when):
    """Write one commit directly into the bare repository using plumbing commands."""
    lines = []
    for path in sorted(tree_entries):
        blob = git(["--git-dir", str(origin), "hash-object", "-w", "--stdin"],
                   input_text=tree_entries[path]).out.strip()
        lines.append(f"100644 blob {blob}\t{path}")
    tree = git(["--git-dir", str(origin), "mktree"], input_text="\n".join(lines) + "\n").out.strip()
    stamp = f"{int(when)} +0000"
    identity = {
        "GIT_AUTHOR_NAME": fixture.FIXTURE_NAME, "GIT_AUTHOR_EMAIL": fixture.FIXTURE_EMAIL,
        "GIT_COMMITTER_NAME": fixture.FIXTURE_NAME, "GIT_COMMITTER_EMAIL": fixture.FIXTURE_EMAIL,
        "GIT_AUTHOR_DATE": stamp, "GIT_COMMITTER_DATE": stamp,
    }
    args = ["--git-dir", str(origin), "commit-tree", tree, "-m", message]
    if parent:
        args += ["-p", parent]
    return git(args, extra_env=identity).out.strip()


def main(argv):
    if len(argv) != 2:
        print(__doc__.strip())
        return 2
    dest = Path(argv[1]).expanduser().resolve()

    if dest.exists():
        print(f"REFUSED: {dest} already exists. Choose a new destination; "
              "an earlier attempt is never overwritten.")
        return 1
    if dest == LAB_ROOT or LAB_ROOT in dest.parents:
        print(f"REFUSED: {dest} is inside the lab pack {LAB_ROOT}. "
              "Keep the disposable workspace outside the course materials.")
        return 1

    dest.mkdir(parents=True)
    origin = dest / "origin.git"
    git(["init", "--quiet", "--bare", "--initial-branch=main", str(origin)])
    print(f"created bare repository   {origin}")

    # Build the history: one minute apart, ending a few minutes ago.
    contents = {}
    parent = None
    commits = []
    start_time = time.time() - 60 * (len(fixture.SEED_HISTORY) + 5)
    for index, (message, changes) in enumerate(fixture.SEED_HISTORY):
        contents.update(changes)
        parent = make_commit(origin, contents, parent, message, start_time + 60 * index)
        commits.append({"commit": parent, "message": message, "changed": sorted(changes)})
        print(f"seeded commit {index + 1}/{len(fixture.SEED_HISTORY)}      {parent[:12]} {message}")

    git(["--git-dir", str(origin), "update-ref", "refs/heads/main", parent])
    git(["--git-dir", str(origin), "symbolic-ref", "HEAD", "refs/heads/main"])
    print(f"set origin.git main to    {parent}")

    record = {
        "lab": "W1.02",
        "origin": "origin.git",
        "branch": "main",
        "start": parent,
        "history": commits,
        "created": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    }
    (dest / fixture.RECORD_NAME).write_text(json.dumps(record, indent=2) + "\n", encoding="utf-8")
    print(f"wrote starting record     {dest / fixture.RECORD_NAME}")
    print()
    print("Next: cd into the workspace and clone the origin yourself:")
    print("  git clone --no-hardlinks origin.git practice")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))

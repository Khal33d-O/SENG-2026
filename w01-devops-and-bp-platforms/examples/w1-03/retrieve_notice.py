"""Build the opening-retrieval repository for W1.03.

Usage:  python3 retrieve_notice.py DESTINATION   (DESTINATION must not exist)

A line was saved and staged, the working file was changed again, then a plain commit was made
without another git add. Compare:
  git show HEAD:notice.txt     (the recorded, staged line)
  cat notice.txt               (the later draft still in the working file)
"""
import os, subprocess, sys
from pathlib import Path

ENV = dict(os.environ, GIT_CONFIG_NOSYSTEM="1", GIT_CONFIG_GLOBAL=os.devnull)

def git(*args, cwd):
    subprocess.run(["git", "-c", "user.name=learner-a", "-c", "user.email=learner@example.invalid",
                    "-c", "commit.gpgsign=false", *args], cwd=cwd, env=ENV, check=True, stdout=subprocess.DEVNULL)

def write(p, t):
    Path(p).write_text(t, encoding="utf-8", newline="\n")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(__doc__); sys.exit(2)
    d = Path(sys.argv[1]).resolve()
    if d.exists():
        print(f"REFUSED: {d} already exists."); sys.exit(1)
    d.mkdir(parents=True)
    git("init", "--quiet", "--initial-branch=main", ".", cwd=d)
    write(d / "notice.txt", "Welcome to the workshop.\n"); git("add", "notice.txt", cwd=d); git("commit", "-qm", "Add notice", cwd=d)
    write(d / "notice.txt", "Workshop starts at 09:30.\n"); git("add", "notice.txt", cwd=d)
    write(d / "notice.txt", "Workshop starts at 09:45.\n")
    git("commit", "-qm", "State the start time", cwd=d)
    print(f"prepared {d}: committed 09:30 line; working file holds the later 09:45 draft")

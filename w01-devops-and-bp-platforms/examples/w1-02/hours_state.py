"""Build the guided-practice repository with three versions of hours.txt.

Usage:  python3 hours_state.py DESTINATION      (DESTINATION must not exist)

Afterwards, inside DESTINATION:
  git show HEAD:hours.txt   -> Open 09:00   (current commit)
  git show :hours.txt       -> Open 09:30   (index)
  cat hours.txt             -> Open 10:00   (working tree)
Predict what a plain `git commit -m "Adjust opening time"` records BEFORE running it.
"""
import os, subprocess, sys
from pathlib import Path

ENV = dict(os.environ, GIT_CONFIG_NOSYSTEM="1", GIT_CONFIG_GLOBAL=os.devnull)

def git(*args, cwd):
    subprocess.run(["git", "-c", "user.name=learner-a", "-c", "user.email=learner@example.invalid",
                    "-c", "commit.gpgsign=false", *args], cwd=cwd, env=ENV, check=True, stdout=subprocess.DEVNULL)

def write(path, text):
    Path(path).write_text(text, encoding="utf-8", newline="\n")

def main():
    if len(sys.argv) != 2:
        print(__doc__); return 2
    dest = Path(sys.argv[1]).resolve()
    if dest.exists():
        print(f"REFUSED: {dest} already exists."); return 1
    dest.mkdir(parents=True)
    git("init", "--quiet", "--initial-branch=main", ".", cwd=dest)
    write(dest / "hours.txt", "Open 09:00\n"); git("add", "hours.txt", cwd=dest)
    git("commit", "--quiet", "-m", "Record opening time", cwd=dest)
    write(dest / "hours.txt", "Open 09:30\n"); git("add", "hours.txt", cwd=dest)
    write(dest / "hours.txt", "Open 10:00\n")
    print(f"prepared {dest}: HEAD 09:00, index 09:30, working 10:00")
    return 0

if __name__ == "__main__":
    sys.exit(main())

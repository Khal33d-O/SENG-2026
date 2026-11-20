"""Create the instructor's W1.02 demonstration workspace.

Usage:  python3 setup_demo.py DESTINATION      (DESTINATION must not exist)

Creates DESTINATION/origin.git: a bare repository whose main branch has one commit
containing welcome.txt ("Welcome to the workshop."). Then follow README.md.
Git runs without global/system configuration; a synthetic identity is used.
"""
import os, subprocess, sys, tempfile
from pathlib import Path

ENV = dict(os.environ, GIT_CONFIG_NOSYSTEM="1", GIT_CONFIG_GLOBAL=os.devnull,
           GIT_AUTHOR_NAME="W1.02 demo", GIT_AUTHOR_EMAIL="demo@example.invalid",
           GIT_COMMITTER_NAME="W1.02 demo", GIT_COMMITTER_EMAIL="demo@example.invalid")

def git(*args, cwd=None):
    subprocess.run(["git", *args], cwd=cwd, env=ENV, check=True, stdout=subprocess.DEVNULL)

def main():
    if len(sys.argv) != 2:
        print(__doc__); return 2
    dest = Path(sys.argv[1]).resolve()
    if dest.exists():
        print(f"REFUSED: {dest} already exists; choose a new destination."); return 1
    dest.mkdir(parents=True)
    git("init", "--quiet", "--bare", "--initial-branch=main", str(dest / "origin.git"))
    with tempfile.TemporaryDirectory() as tmp:
        git("init", "--quiet", "--initial-branch=main", tmp)
        Path(tmp, "welcome.txt").write_text("Welcome to the workshop.\n", encoding="utf-8", newline="\n")
        git("add", "welcome.txt", cwd=tmp)
        git("-c", "commit.gpgsign=false", "commit", "--quiet", "-m", "Add the workshop welcome", cwd=tmp)
        git("push", "--quiet", str(dest / "origin.git"), "main", cwd=tmp)
    print(f"created {dest / 'origin.git'} with welcome.txt on main")
    print(f"next: cd {dest} and run the Worked Example 1 commands")
    return 0

if __name__ == "__main__":
    sys.exit(main())

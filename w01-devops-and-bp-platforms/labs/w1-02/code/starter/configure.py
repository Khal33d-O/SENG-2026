"""Configure the W1.02 practice clone for the fixture.

Usage:  python3 configure.py PATH_TO_PRACTICE_CLONE

Writes settings to the clone's own .git/config only (never global or system):

  user.name / user.email   synthetic identity learner-a <learner@example.invalid>
  core.hooksPath           an empty folder, so no hook runs in this fixture
  commit.gpgsign, tag.gpgsign   false, so no signing key is needed
  core.autocrlf            false, so working files keep the fixture's LF endings
"""

import sys

sys.dont_write_bytecode = True

from pathlib import Path

import fixture
from fixture import git


def main(argv):
    if len(argv) != 2:
        print(__doc__.strip())
        return 2
    clone = Path(argv[1]).expanduser().resolve()

    probe = git(["rev-parse", "--is-inside-work-tree", "--show-toplevel"], cwd=clone, check=False)
    if probe.returncode != 0:
        print(f"REFUSED: {clone} is not a Git working tree. Check your current directory (pwd).")
        return 1
    top = Path(probe.out.splitlines()[1]).resolve()
    if top != clone:
        print(f"REFUSED: {clone} is inside the repository {top}; pass the clone's top folder.")
        return 1
    url = git(["remote", "get-url", "origin"], cwd=clone, check=False).out.strip()
    if not url.rstrip("/\\").endswith("origin.git"):
        print(f"REFUSED: remote 'origin' is {url or 'missing'}; this helper only configures "
              "a clone of the supplied origin.git.")
        return 1

    was_clean = git(["status", "--porcelain"], cwd=clone).out.strip() == ""

    hooks = clone / ".git" / "no-hooks"
    hooks.mkdir(exist_ok=True)
    settings = [
        ("user.name", fixture.LEARNER_NAME),
        ("user.email", fixture.LEARNER_EMAIL),
        ("core.hooksPath", hooks.as_posix()),
        ("commit.gpgsign", "false"),
        ("tag.gpgsign", "false"),
        ("core.autocrlf", "false"),
    ]
    for key, value in settings:
        git(["config", "--local", key, value], cwd=clone)
        print(f"set (local) {key:<15} = {value}")

    # A clone made while a system-wide autocrlf setting was active can have CRLF
    # working files. On an untouched clone, rewrite them to the committed bytes.
    if was_clean:
        rewritten = []
        for path in fixture.TRACKED_FILES:
            target = clone / path
            committed = git(["show", f"HEAD:{path}"], cwd=clone, check=False)
            if committed.returncode == 0 and target.is_file() and target.read_bytes() != committed.stdout:
                target.write_bytes(committed.stdout)
                rewritten.append(path)
        if rewritten:
            git(["update-index", "--refresh"], cwd=clone, check=False)
            print("normalised line endings: " + ", ".join(rewritten))

    print(f"configured {clone} (hooks disabled, signing disabled, synthetic identity)")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))

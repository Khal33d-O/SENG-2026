"""Semantic checker for the W1.02 practice clone.

Usage:
  python3 test_state.py PATH_TO_PRACTICE_CLONE --baseline   fresh clone is ready (Task 1)
  python3 test_state.py PATH_TO_PRACTICE_CLONE              final acceptance check (Task 6)

It reads committed objects, the index, working files and the local bare origin.
A PASS corroborates your evidence; it does not replace your explanation.
"""

import sys

sys.dont_write_bytecode = True

from pathlib import Path

import fixture
from fixture import git, read_text


class Checker:
    def __init__(self):
        self.failures = 0

    def check(self, ok, label, detail=""):
        print(("PASS " if ok else "FAIL ") + label + ("" if ok or not detail else f"\n       {detail}"))
        if not ok:
            self.failures += 1
        return ok


def show(clone, spec):
    result = git(["show", spec], cwd=clone, check=False)
    return result.out.replace("\r\n", "\n") if result.returncode == 0 else None


def main(argv):
    args = [a for a in argv[1:] if not a.startswith("--")]
    baseline = "--baseline" in argv
    if len(args) != 1:
        print(__doc__.strip())
        return 2
    clone = Path(args[0]).expanduser().resolve()
    c = Checker()

    if not c.check(git(["rev-parse", "--is-inside-work-tree"], cwd=clone, check=False).returncode == 0,
                   "the path is a Git working tree", f"{clone} (check pwd)"):
        return 1
    url = git(["remote", "get-url", "origin"], cwd=clone, check=False).out.strip()
    origin = Path(url).expanduser()
    if not origin.is_absolute():
        origin = (clone / origin).resolve()
    record = fixture.load_record(origin) if origin.exists() else None
    if not c.check(record is not None, "clone comes from the supplied local bare origin.git",
                   f"origin is {url!r}; expected the prepared origin.git with its starting record"):
        return 1
    start = record["start"]
    head = git(["rev-parse", "HEAD"], cwd=clone).out.strip()
    origin_main = git(["--git-dir", str(origin), "rev-parse", "refs/heads/main"], check=False).out.strip()
    tracking = git(["rev-parse", "origin/main"], cwd=clone, check=False).out.strip()

    if baseline:
        c.check(head == start, "HEAD is the supplied starting commit", f"HEAD {head}, start {start}")
        c.check(origin_main == start, "origin.git main is the starting commit")
        status = git(["status", "--porcelain"], cwd=clone).out
        c.check(status.strip() == "", "working tree and index are clean", status.strip())
        for path in fixture.TRACKED_FILES:
            c.check((clone / path).is_file(), f"{path} is present")
        email = git(["config", "--local", "user.email"], cwd=clone, check=False).out.strip()
        c.check(email == fixture.LEARNER_EMAIL, "synthetic local identity configured (configure.py)", email)
    else:
        parents = git(["rev-list", "--parents", "-n", "1", "HEAD"], cwd=clone).out.split()[1:]
        count = git(["rev-list", "--count", f"{start}..HEAD"], cwd=clone, check=False).out.strip()
        c.check(count == "1" and parents == [start], "exactly one new local commit on top of the start",
                f"commits after start: {count}; parents of HEAD: {parents}")
        changed = git(["diff", "--name-only", start, "HEAD"], cwd=clone, check=False).out.split()
        c.check(changed == ["display.txt"], "the new commit changes only display.txt", f"changed: {changed}")
        c.check(show(clone, "HEAD:display.txt") == fixture.APPROVED_LABEL,
                "committed display.txt is the approved reference label", repr(show(clone, "HEAD:display.txt")))
        c.check(read_text(clone / "display.txt") == fixture.FRIDAY_DRAFT,
                "the later Friday label remains in working display.txt")
        c.check(read_text(clone / "notes.txt") == fixture.SESSION_DRAFT,
                "the session draft remains in working notes.txt")
        c.check(show(clone, "HEAD:notes.txt") == fixture.NOTES_START,
                "the commit excludes the session draft")
        c.check(show(clone, "HEAD:instructions.txt") == fixture.WRONG_INSTRUCTIONS_2,
                "the commit excludes the instruction recovery")
        cached = git(["diff", "--cached", "--name-only"], cwd=clone).out.strip()
        c.check(cached == "", "the index matches the new commit (nothing staged)", cached)
        c.check(read_text(clone / "instructions.txt") == fixture.REQUIRED_INSTRUCTIONS,
                "working instructions.txt holds the required reference-board instructions",
                repr(read_text(clone / "instructions.txt")))
        c.check(origin_main == start, "the bare origin still names the starting commit", origin_main)
        c.check(tracking == start, "origin/main still names the starting commit", tracking)

    print()
    if c.failures:
        print(f"RESULT: FAIL ({c.failures} check(s) failed)" + (" - baseline" if baseline else ""))
        return 1
    print("RESULT: PASS" + (" - baseline ready; the acceptance check will fail until you finish the tasks" if baseline else ""))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))

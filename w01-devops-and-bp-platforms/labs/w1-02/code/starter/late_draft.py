"""Introduce the late display request and an unrelated session draft (W1.02 Task 3).

Usage:  python3 late_draft.py PATH_TO_PRACTICE_CLONE

Checks first that the approved label is staged (Task 2), then writes:
  display.txt  the later Friday label (a draft that must NOT be committed)
  notes.txt    an unrelated session note (a draft that must NOT be committed)
It refuses to overwrite a working file that already differs from what it expects.
It never stages or commits anything.
"""

import sys

sys.dont_write_bytecode = True

from pathlib import Path

import fixture
from fixture import git, read_text, write_text


def main(argv):
    if len(argv) != 2:
        print(__doc__.strip())
        return 2
    clone = Path(argv[1]).expanduser().resolve()
    if git(["rev-parse", "--is-inside-work-tree"], cwd=clone, check=False).returncode != 0:
        print(f"REFUSED: {clone} is not a Git working tree. Check your current directory (pwd).")
        return 1

    staged = git(["show", ":display.txt"], cwd=clone, check=False).out.replace("\r\n", "\n")
    if staged != fixture.APPROVED_LABEL:
        print("REFUSED: the index does not contain the approved label for display.txt.")
        print(f"  expected staged: {fixture.APPROVED_LABEL.strip()!r}")
        print(f"  actual staged:   {staged.strip()!r}")
        print("Complete Task 2 (edit, then git add -- display.txt) before introducing the late request.")
        return 1

    display = clone / "display.txt"
    notes = clone / "notes.txt"
    current_display = read_text(display)
    current_notes = read_text(notes)
    if current_display not in (fixture.APPROVED_LABEL, fixture.FRIDAY_DRAFT):
        print(f"REFUSED: display.txt contains an unexpected draft {current_display.strip()!r}; preserve it first.")
        return 1
    if current_notes not in (fixture.NOTES_START, fixture.SESSION_DRAFT):
        print("REFUSED: notes.txt contains an unexpected draft; preserve it before running this helper.")
        return 1

    write_text(display, fixture.FRIDAY_DRAFT)
    write_text(notes, fixture.SESSION_DRAFT)
    print("late request written to working display.txt: " + fixture.FRIDAY_DRAFT.strip())
    print("unrelated session draft added to working notes.txt")
    print("Nothing was staged or committed. Inspect the index and the working files before deciding.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))

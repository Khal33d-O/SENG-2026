"""Shared values and helpers for the W1.02 lab scripts.

Every script in this folder imports this module. It holds the fixture's exact
file contents and one helper for running Git without reading or writing any
global or system configuration. Nothing here changes a repository by itself.
"""

import json
import os
import subprocess
import sys
from pathlib import Path

sys.dont_write_bytecode = True  # keep the supplied lab folder free of __pycache__

# ---------------------------------------------------------------------------
# Exact contents (every file ends with one newline).
# ---------------------------------------------------------------------------
WORKSHOP_LABEL = "Board label: Workshop\n"
APPROVED_LABEL = "Board label: Reference treasure hunt\n"
FRIDAY_DRAFT = "Board label: Friday treasure hunt\n"

REQUIRED_INSTRUCTIONS = "Choose Reference treasure hunt.\nUse the Load board button.\n"
WRONG_INSTRUCTIONS_1 = "Choose Missing board.\nUse the Load board button.\n"
WRONG_INSTRUCTIONS_2 = "Choose Missing board.\nThen use the Load board button.\n"

NOTES_FIRST = "Session notes\n"
NOTES_START = "Session notes\nKeep drafts out of approved commits.\n"
SESSION_DRAFT = (
    "Session notes\n"
    "Keep drafts out of approved commits.\n"
    "Draft: ask the group which board loaded first.\n"
)

TRACKED_FILES = ("display.txt", "instructions.txt", "notes.txt")

# The seed history, oldest first: (message, {path: contents}).
# Each commit lists only the paths it changes. The nearest earlier versions of
# instructions.txt are deliberately wrong; only the oldest one is correct.
SEED_HISTORY = [
    ("Add the workshop text files", {
        "display.txt": WORKSHOP_LABEL,
        "instructions.txt": REQUIRED_INSTRUCTIONS,
        "notes.txt": NOTES_FIRST,
    }),
    ("Update the board instructions", {"instructions.txt": WRONG_INSTRUCTIONS_1}),
    ("Restore the board instructions", {"instructions.txt": WRONG_INSTRUCTIONS_2}),
    ("Add a session notes reminder", {"notes.txt": NOTES_START}),
]

# The state at the starting commit (the tip of SEED_HISTORY).
START_CONTENTS = {
    "display.txt": WORKSHOP_LABEL,
    "instructions.txt": WRONG_INSTRUCTIONS_2,
    "notes.txt": NOTES_START,
}

RECORD_NAME = "fixture-start.json"  # written next to origin.git by prepare.py

LEARNER_NAME = "learner-a"
LEARNER_EMAIL = "learner@example.invalid"
FIXTURE_NAME = "W1.02 fixture"
FIXTURE_EMAIL = "fixture@example.invalid"


def git_env(extra=None):
    """Environment for Git calls made by these scripts.

    System and global configuration are ignored so that a learner's own
    settings neither affect nor are affected by the fixture.
    """
    env = dict(os.environ)
    env["GIT_CONFIG_NOSYSTEM"] = "1"
    env["GIT_CONFIG_GLOBAL"] = os.devnull
    env["GIT_TERMINAL_PROMPT"] = "0"
    env["GIT_PAGER"] = "cat"
    env["LC_ALL"] = env.get("LC_ALL", "C")
    if extra:
        env.update(extra)
    return env


def git(args, cwd=None, input_text=None, check=True, extra_env=None):
    """Run one Git command and return its completed process (text mode, UTF-8)."""
    result = subprocess.run(
        ["git", *args],
        cwd=None if cwd is None else str(cwd),
        input=None if input_text is None else input_text.encode("utf-8"),
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        env=git_env(extra_env),
    )
    result.out = result.stdout.decode("utf-8", "replace")
    result.err = result.stderr.decode("utf-8", "replace")
    if check and result.returncode != 0:
        raise SystemExit(
            f"git {' '.join(args)} failed (exit {result.returncode}):\n{result.err.strip()}"
        )
    return result


def read_text(path):
    """Read a working file as text, treating CRLF as LF (editor-safe)."""
    data = Path(path).read_bytes().decode("utf-8", "replace")
    return data.replace("\r\n", "\n")


def write_text(path, text):
    """Write text with LF line endings, byte for byte."""
    with open(path, "w", encoding="utf-8", newline="\n") as handle:
        handle.write(text)


def load_record(origin_dir):
    """Load the starting record that prepare.py wrote beside origin.git."""
    record_path = Path(origin_dir).parent / RECORD_NAME
    if not record_path.is_file():
        return None
    return json.loads(record_path.read_text(encoding="utf-8"))

#!/usr/bin/env python3
"""Read-only look at the retained SQLite file (the book's one-line python3 -c command, as a script).

    python3 inspect_db.py /tmp/academy-w5-demo/game.db
"""
import sqlite3
import sys

path = sys.argv[1] if len(sys.argv) > 1 else "/tmp/academy-w5-demo/game.db"
c = sqlite3.connect(f"file:{path}?mode=ro", uri=True)
print(c.execute("select SessionId, BoardId, StateJson from Sessions limit 1").fetchone())
print(c.execute("select MigrationId from __EFMigrationsHistory").fetchall())

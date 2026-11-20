# Deployment and recovery record

Mode: [ ] classroom Argo CD   [ ] LOCAL RECONCILE (not Argo CD)
Known-good image saved BEFORE the candidate (W5_GOOD): ______

| Step | Source commit | Image (tag) | Image ID | Configuration commit | Runtime image ID | Ready | Health release | Prior session equal? | East x=1, 5 moves? | Hint legal, no state change? |
|---|---|---|---|---|---|---|---|---|---|---|
| Known-good (C1) | | | | | | | | n/a (first) | | |
| Candidate (C2) | | | | | | | | | | |
| Restored (C3) | | | | | | | | | | |

Prediction before each sync (health release, retained session): ______

Unchanged in Git between C2 and C3 (paste the relevant `git log -p` lines for the migration image and
volume): ______

Why this is not a database rollback, and what would differ after a destructive migration: ______

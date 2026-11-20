# Handover outline

1. Purpose and controls (New game, moves, Load session, Hint, Fail next save).
2. Architecture: browser → API/rules → SQLite, and API → hint adapter (diagram).
3. API examples: start (`POST /api/sessions`), action (`POST /api/sessions/{id}/actions`), get
   (`GET /api/sessions/{id}`), hint (`POST /api/sessions/{id}/hint`) with representative responses.
4. Startup and tests: exact commands and exit codes (`run.py test|rehearse|serve`).
5. Simulated hint modes (success, validation, timeout) and their limitations; no live model.
6. Identities: source commit, image tag and ID, configuration commit, runtime image ID.
7. Retained directory and reset semantics: New game creates a new session; deleting storage is not a reset.
8. Migration assumptions: explicit `--migrate`, InitialSessions, no schema rollback on image restore.
9. Restore commands (select the known-good image, sync, check).
10. Request-ID diagnosis: browser error → `api.log` → Grafana.
11. Limitations and follow-up owners.

Exclude credentials, kubeconfig and private environment records.

# Handover: academy game (Week 5 release)

1. **Purpose and controls**
2. **Architecture**

   ```
   browser (wwwroot) --HTTP--> ASP.NET Core API --> C# rules
                                   |        \--> SQLite (GAME_DB, retained /data)
                                   \--> hint server (simulated model; stored state only)
   ```

3. **API examples** (start, action, get, hint) with representative responses
4. **Startup and tests** (exact commands and exits)
5. **Simulated hint modes** (success, validation, timeout) and limitations
6. **Identities**: source commit, image tag and ID, configuration commit, runtime image ID
7. **Retained directory and reset semantics** (New game creates a new session; never delete storage to reset)
8. **Migration assumptions** (explicit `--migrate`, InitialSessions; image restore does not roll back data)
9. **Restore commands** (select the known-good image, sync, check)
10. **Request-ID diagnosis** (browser error → `api.log` → Grafana)
11. **Limitations and follow-up owners**

Exclude credentials, kubeconfig and private environment records.

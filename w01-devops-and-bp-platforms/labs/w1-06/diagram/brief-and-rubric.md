# Diagram brief, annotation notes and rubric

Brief: annotate the browser arrow with the host URL you opened; place frontend and API listeners inside their
container boundaries; label the frontend-to-API arrow with the alias and listener; annotate API_UPSTREAM,
BROWSER_API_URL and PUBLIC_LABEL with their reader and public purpose; mark where loopback is interpreted; add the
response labels (who produced each result: API, frontend or browser) after Task 4.

Annotation notes: a label saying only "API" cannot show which address the caller used. An allocated numeric IP is an
observation, not a configuration value. The API has no host-published port.

| Criterion | Meets | Not yet |
|---|---|---|
| Callers | Both requesting processes identified | One arrow for "the request" |
| Addresses | Host URL, frontend listener, alias api, API listener 8181 | Loopback drawn as "the host" for every caller |
| Settings | Reader and public purpose for all three | Settings without readers |
| Producers | API 404, frontend 502 and absent browser response distinguished | All failures called "network" |

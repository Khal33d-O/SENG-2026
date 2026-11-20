# Week 1 foundation application (`code/app`)

The supplied ASP.NET Core (`net10.0`) foundation used by W1.10 and Project 1: one process serving the page
(`wwwroot/index.html`, `site.css`, `app.js`, `client.json`) and the board API.

| Route | Response |
|---|---|
| `GET /` | the supplied page |
| `GET /api/boards/reference` | `200` reference board (shared fixture `board-reference.json`) |
| `GET /api/boards/slow`, `/api/boards/overdue` | the same board after 300 ms / 900 ms server processing (W1.10 timing fixtures) |
| `GET /api/boards/{other}` | `404 {"code":"NOT_FOUND","message":"Board not found"}` |
| `GET /healthz` | `200 Healthy` |

Every response carries `X-Lab-Release: foundation-observe-a`, `X-Lab-Environment` (from `LAB_ENV`) and `X-Request-Id`
(echoed from the client). Each request writes one JSON completion record to stdout (`job`, `session` from `LAB_SESSION`,
`request_id`, `action_id`, `path`, `status`, `result_status`, `response_status`, `duration_ms`/`elapsed_ms`,
`caller_aborted`, `release`, `environment`) and pushes it to Loki when `LOCAL_LOKI_URL` is set. The listener is chosen
with `ASPNETCORE_URLS` (port 8080 in containers).

Build: `dotnet publish app/Foundation.csproj -c Release -o publish --nologo` (course pin .NET SDK 10.0.401; `global.json`
rolls forward from 10.0.100). Do not edit this folder during the labs: copy it, as the Project 1 brief does
(`cp -R ../code/app ...` from `projects/p1`).

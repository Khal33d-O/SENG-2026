# Captured observations (recorded run, not a live result)

Recorded 2026-10-10 by the course author with Podman 5.7.0 (Windows podman machine). Starting state with the
unmodified code/starter/settings.env (frontend 502 and the three probes). Use only for interpretation while your environment
is blocked, and mark the work as captured evidence.

```text
### up starter
$ podman network create --label academy.module=w1-06 w106-net
  w106-net
$ podman run --detach --name w106-api --label academy.module=w1-06 --network w106-net --network-alias api --env LAB_ROLE=api --env ASPNETCORE_URLS=http://0.0.0.0:8181 localhost/academy-w106:10.0.12
  489207473bcc3a263d8d5ef7a0b8365b8c8683e554a7debeadf3cd4f51ded2f9
$ podman run --detach --name w106-frontend --label academy.module=w1-06 --network w106-net --env-file starter\settings.env --env LAB_ROLE=frontend --env ASPNETCORE_URLS=http://0.0.0.0:8080 --publish 127.0.0.1:4316:8080 localhost/academy-w106:10.0.12
  69dc2341ed0aaa8d5a91264c7406427c5ece965a32f62a115c7c43b04dc7aa5a
Fixed alias probe (readiness of the supplied network, independent of your settings):
$ podman exec w106-frontend dotnet /app/Relay.dll probe http://api:8181/healthz
  HTTP 200
  Healthy
exit 0 (caller: frontend container w106-frontend)
READY http://127.0.0.1:4316/  (settings starter/settings.env; label workshop-starter)
### browser-equivalent request
HTTP/1.1 502 Bad Gateway
{"code":"UPSTREAM_UNREACHABLE","service":"w106-frontend","upstream":"http://127.0.0.1:8181/api/boards/reference","message":"No HTTP response from the configured upstream"}### probes
$ podman exec w106-api dotnet /app/Relay.dll probe http://127.0.0.1:8181/api/boards/reference
  HTTP 200
  {"service":"w106-reference-api","board":{"id":"reference","name":"Reference treasure hunt","width":3,"height":3,"start":{"x":0,"y":0},"walls":[{"x":1,"y":1}],"treasures":[{"id":"t1","x":2,"y":0,"value":10}],"exit":{"x":2,"y":2},"initialMoves":6}}
exit 0 (caller: api container w106-api)
$ podman exec w106-frontend dotnet /app/Relay.dll probe http://127.0.0.1:8181/api/boards/reference
  NO_HTTP_RESPONSE http://127.0.0.1:8181/api/boards/reference (Connection refused (127.0.0.1:8181))
exit 3 (caller: frontend container w106-frontend)
$ podman exec w106-frontend dotnet /app/Relay.dll probe http://api:8181/api/boards/reference
  HTTP 200
  {"service":"w106-reference-api","board":{"id":"reference","name":"Reference treasure hunt","width":3,"height":3,"start":{"x":0,"y":0},"walls":[{"x":1,"y":1}],"treasures":[{"id":"t1","x":2,"y":0,"value":10}],"exit":{"x":2,"y":2},"initialMoves":6}}
exit 0 (caller: frontend container w106-frontend)
```

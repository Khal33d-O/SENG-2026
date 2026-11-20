# Captured observations (recorded run, not a live result)

Recorded 2026-10-10 by the course author with Podman 5.7.0 (podman machine on Windows), image
`localhost/academy-w104:10.0.12`. Image IDs differ on every preparation. Mark work based on these as captured evidence;
they support interpretation while access is recovered and do not replace your own diagnosis.

## Guided route and the unedited starter (Task 2 instance w104-work)

```text
### guided
$ podman run --detach --name w104-guided --label academy.module=w1-04 --publish 127.0.0.1:9102:8080 localhost/academy-w104:10.0.12
  55316917d973ca5844253648fbd54075fbd42d0f34a9af95b173b414f36a00a8
$ podman inspect --format image={{.ImageName}} image_id={{.Image}} running={{.State.Running}} status={{.State.Status}} w104-guided
  image=localhost/academy-w104:10.0.12 image_id=ab0ab29f275db7b0973a76cfc6655e6f18875f2b31b9611f80792c40e0b906f8 running=true status=running
$ podman top w104-guided
  USER        PID         PPID        %CPU        ELAPSED       TTY         TIME        COMMAND
  root        1           0           0.000       4.955329093s  ?           0s          dotnet Foundation.dll
$ podman logs w104-guided
  warn: Microsoft.AspNetCore.Hosting.Diagnostics[15]
        Overriding HTTP_PORTS '8080' and HTTPS_PORTS ''. Binding to values defined by URLS instead 'http://0.0.0.0:8080'.
  info: Microsoft.Hosting.Lifetime[14]
        Now listening on: http://0.0.0.0:8080
  info: Microsoft.Hosting.Lifetime[0]
        Application started. Press Ctrl+C to shut down.
  info: Microsoft.Hosting.Lifetime[0]
        Hosting environment: Production
  info: Microsoft.Hosting.Lifetime[0]
        Content root path: /app
$ podman port w104-guided
  8080/tcp -> 127.0.0.1:9102
GET http://127.0.0.1:9102/  -> HTTP 200
GET http://127.0.0.1:9102/api/boards/reference -> HTTP 200
  X-Lab-Release: foundation-a  X-Lab-Environment: unset
PASS: page and exact reference-board fixture
$ podman stop w104-guided
  w104-guided
GET http://127.0.0.1:9102/  -> NO HTTP RESPONSE (Remote end closed connection without response)
GET http://127.0.0.1:9102/api/boards/reference -> NO HTTP RESPONSE ([WinError 10061] No connection could be made because the target machine actively refused it)
FAIL: page and exact reference-board fixture
$ podman rm w104-guided
  w104-guided
### starter running instance
$ podman run --detach --name w104-work --label academy.module=w1-04 --publish 127.0.0.1:9123:80 localhost/academy-w104:10.0.12
  76b0996ec886f38b4bae2c18941ca42ffe30c45d87891d9d5e7e35fb65b6bf36
$ podman inspect --format image={{.ImageName}} image_id={{.Image}} running={{.State.Running}} status={{.State.Status}} w104-work
  image=localhost/academy-w104:10.0.12 image_id=ab0ab29f275db7b0973a76cfc6655e6f18875f2b31b9611f80792c40e0b906f8 running=true status=running
$ podman top w104-work
  USER        PID         PPID        %CPU        ELAPSED       TTY         TIME        COMMAND
  root        1           0           0.000       4.995879914s  ?           0s          dotnet Foundation.dll
$ podman logs w104-work
  warn: Microsoft.AspNetCore.Hosting.Diagnostics[15]
        Overriding HTTP_PORTS '8080' and HTTPS_PORTS ''. Binding to values defined by URLS instead 'http://0.0.0.0:8080'.
  info: Microsoft.Hosting.Lifetime[14]
        Now listening on: http://0.0.0.0:8080
  info: Microsoft.Hosting.Lifetime[0]
        Application started. Press Ctrl+C to shut down.
  info: Microsoft.Hosting.Lifetime[0]
        Hosting environment: Production
  info: Microsoft.Hosting.Lifetime[0]
        Content root path: /app
$ podman port w104-work
  80/tcp -> 127.0.0.1:9123
GET http://127.0.0.1:9123/  -> NO HTTP RESPONSE (Remote end closed connection without response)
GET http://127.0.0.1:9123/api/boards/reference -> NO HTTP RESPONSE (Remote end closed connection without response)
FAIL: page and exact reference-board fixture
$ podman stop w104-work
  w104-work
$ podman rm w104-work
  w104-work
```

## Task 4 observation instance (changed profile): state and startup log only

```text
$ podman inspect --format image={{.ImageName}} image_id={{.Image}} running={{.State.Running}} status={{.State.Status}} w104-observe
  image=localhost/academy-w104:10.0.12 image_id=ab0ab29f275db7b0973a76cfc6655e6f18875f2b31b9611f80792c40e0b906f8 running=true status=running
$ podman top w104-observe
  USER        PID         PPID        %CPU        ELAPSED     TTY         TIME        COMMAND
  root        1           0           0.000       5.8943519s  ?           0s          dotnet Foundation.dll
$ podman logs w104-observe
  warn: Microsoft.AspNetCore.Hosting.Diagnostics[15]
        Overriding HTTP_PORTS '8080' and HTTPS_PORTS ''. Binding to values defined by URLS instead 'http://0.0.0.0:8090'.
  info: Microsoft.Hosting.Lifetime[14]
        Now listening on: http://0.0.0.0:8090
  info: Microsoft.Hosting.Lifetime[0]
        Application started. Press Ctrl+C to shut down.
  info: Microsoft.Hosting.Lifetime[0]
        Hosting environment: Production
  info: Microsoft.Hosting.Lifetime[0]
        Content root path: /app
$ podman port w104-observe
```

# W1.04 worked examples: run, inspect and stop the supplied image

Instructor demonstration from the lab folder [`../../labs/w1-04/`](../../labs/w1-04/). The image is prepared before class
(`python3 lab.py prepare`, which builds `image/Containerfile`). On the Podman fallback replace the leading `docker`
with `podman` and record which engine you used. Tested 2026-10-10 with Podman 5.7.0.

## Worked Example 1: establish a starting state

```bash
pwd
docker --version
docker image inspect localhost/academy-w104:10.0.12
```

## Worked Example 1: run the supplied image

```bash
docker run --detach --name w104-demo \
  --label academy.module=w1-04 \
  --publish 127.0.0.1:9100:8080 \
  localhost/academy-w104:10.0.12
```

A returned container ID shows that the engine created the instance.

## Worked Example 1: inspect process and logs

```bash
docker inspect w104-demo
docker top w104-demo
docker logs w104-demo
docker port w104-demo
```

Expected: the process listing shows `dotnet Foundation.dll`; the log contains `Now listening on: http://0.0.0.0:8080`;
the port output shows `8080/tcp -> 127.0.0.1:9100`. Then open `http://127.0.0.1:9100/` and request
`/api/boards/reference`: board ID `reference`, `initialMoves` 6.

## Worked Example 2: predict a moved host endpoint, then verify the replacement

Predict which URL (9100 or 9101) reaches the replacement and what stays unchanged inside the container.

```bash
docker stop w104-demo
docker rm w104-demo
docker run --detach --name w104-demo \
  --label academy.module=w1-04 \
  --publish 127.0.0.1:9101:8080 \
  localhost/academy-w104:10.0.12
docker port w104-demo
```

Request both URLs: 9100 has no remaining instance from this demonstration; 9101 returns the page.

## Worked Example 2: retain evidence and stop

```bash
docker stop w104-demo
docker inspect w104-demo
docker logs w104-demo
docker rm w104-demo
```

After `stop`, inspection shows the process is not running while the earlier startup log still contains the listener
line; a fresh request fails. Recorded output of the same adapter operations:
[`../../labs/w1-04/captures/observations.md`](../../labs/w1-04/captures/observations.md).

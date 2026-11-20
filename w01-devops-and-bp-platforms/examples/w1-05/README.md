# W1.05 worked examples: write, build, tag and run the guided page recipe

Run from the lab folder [`../../labs/w1-05/`](../../labs/w1-05/). On the tested local alternative replace `docker`
with `podman`; keep one engine for the whole exercise. On Windows Git Bash set `MSYS_NO_PATHCONV=1` so paths such as
`/usr/share/nginx/html/index.html` are not rewritten. Tested 2026-10-10 with Podman 5.7.0.

## Resolve COPY from the selected directory (illustration only)

```bash
docker build -f deploy/Dockerfile -t local-page:demo context
```

`COPY site/ ...` would read `context/site/`, not `deploy/site/`. This command is illustrative; there is no `deploy`
folder in the lab.

## Worked Example 1: write the supplied page recipe

Copy the full pinned `FROM` line from `starter/Dockerfile` into a blank editor tab, then type:

```dockerfile
COPY site/ /usr/share/nginx/html/
```

Save the two lines as `guided/Dockerfile` (this is exactly the supplied guided recipe).

## Build with an explicit recipe, tag and context

```bash
docker build -f guided/Dockerfile -t localhost/academy-w105:demo guided
```

## Give a built image another name

```bash
docker image tag localhost/academy-w105:demo localhost/academy-w105:saved
docker image inspect localhost/academy-w105:demo
docker image inspect localhost/academy-w105:saved
```

Both `Id` fields are identical: tagging did not run the build instructions.

## Publish a host endpoint for the existing listener

```bash
docker run --detach --name w105-demo -p 127.0.0.1:8105:80 localhost/academy-w105:demo
```

Open `http://127.0.0.1:8105`: "Equipment readiness" with the inspection status and its stylesheet.

## Worked Example 2: build, tag and run the result

```bash
docker run --rm --entrypoint cat localhost/academy-w105:demo /usr/share/nginx/html/index.html
docker logs w105-demo
```

The first command prints the packaged HTML (same release label as the browser). Then `docker stop w105-demo` and
`docker rm w105-demo`; the image remains available.

## Guided practice: diagnose a missing copy source (captured observation)

Choosing `guided/site` as the context while the recipe still copies `site/` fails during the build:

```text
$ podman build -f guided/Dockerfile -t localhost/academy-w105:demo guided/site
STEP 2/2: COPY site/ /usr/share/nginx/html/
Error: building at STEP "COPY site/ /usr/share/nginx/html/": checking on sources under ".../w105/guided/site": copier: stat: "/site": no such file or directory
```

## Base image reference

[`base-image-reference/docker-entrypoint.sh`](base-image-reference/docker-entrypoint.sh) is the base's entrypoint,
copied out of the pinned image with `docker run --rm --entrypoint cat <image> /docker-entrypoint.sh` for inspection.
`docker image inspect` on the base shows `Entrypoint [/docker-entrypoint.sh]` and `Cmd [nginx -g daemon off;]`; an image
whose recipe has only FROM and COPY inherits both.

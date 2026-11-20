# W1.05 lab: build the supplied static front end

The supplied front end has a page and a stylesheet. Your Dockerfile must place the requested files where the supplied
NGINX server reads them, then you must build and check the resulting image. You own
[`starter/Dockerfile`](starter/Dockerfile), your predictions and your evidence ([`evidence.md`](evidence.md)). Do not
edit the supplied HTML, CSS, tests or server configuration to make a check pass.

## Timing

| Block | Minutes |
|---|---|
| Retrieval, concepts and worked examples | about 45 |
| Guided practice (known guided recipe, file/request comparison) | 15 |
| Challenge: Task 1 8, Task 2 12, Task 3 15, Task 4 10 | 45 |
| Quiz, individual evidence and paper transfer | 15 |
| Recovery, feedback and saving | 10 |

## Outcomes

* Describe the purpose of a base image, build context and startup command.
* Explain how a Dockerfile produces a repeatable application image.
* Write a Dockerfile for the supplied static front end using a provided base-image example.
* Create and run a tagged image, verifying that it serves the expected page.

## Setup and guided baseline

Prepared Docker installation from W1.04, Python 3 and a terminal. Open this lab directory: you should see `lab.py`,
[`Makefile`](Makefile), [`guided/`](guided/) and [`starter/`](starter/). On the tested local alternative replace
`docker` with `podman`, pass `--engine podman` to `lab.py`, and use `make ENGINE=podman ...`. Do not mix engine stores.
On Windows Git Bash set `MSYS_NO_PATHCONV=1` for direct engine commands that contain container paths.

The base is NGINX 1.30.4 on Debian trixie, pinned by its full digest in the supplied Dockerfiles. Before class the
facilitator runs `python3 lab.py prepare` (an explicit download) or loads an approved archive. Required tests use the
local image (`--pull=never`) and contact no external service. The inherited server command is `nginx -g 'daemon off;'`,
reached through the base's `/docker-entrypoint.sh`; it listens on container port 80 and serves `/usr/share/nginx/html`.
`EXPOSE` metadata alone does not publish a host endpoint.

Run `make guided` once, then `make baseline` against the unedited starter (the NGINX welcome page must be reachable),
then `make test-core` — the unfinished recipe should **fail** the application checks. Without make:
`python3 lab.py guided`, `python3 lab.py baseline`, `python3 lab.py test --variant core --tag localhost/academy-w105:core`.

Worked examples: [`../../examples/w1-05/README.md`](../../examples/w1-05/README.md).

## Task 1: Identify the recipe inputs and baseline (8 minutes)

Open the unedited `starter/Dockerfile`. Locate its `FROM` and compare it with the complete guided recipe. Name the
build context, the base that supplies the server and the inherited startup behaviour. Record why the starter can build
and run before it includes the application; predict whether the base page or the North gate briefing will appear; keep
the failed application check and one actual image ID.

## Task 2: Build and verify the first application image (12 minutes)

The first required application is the complete `starter/public/` directory (`index.html` and its `site.css`); both must
appear at the server's document root. Keep the inherited startup. Explain your source and destination paths to your
partner before building.

```bash
docker build -f starter/Dockerfile -t localhost/academy-w105:core starter
```

```bash
python3 lab.py test --variant core --tag localhost/academy-w105:core
```

Retain a copy of this working recipe as `evidence-core.Dockerfile` outside `starter`, and save the image ID and tag.
For a browser view: `docker run --detach --name w105-view -p 127.0.0.1:8105:80 localhost/academy-w105:core`, open
`http://127.0.0.1:8105`, then `docker stop w105-view` and `docker rm w105-view`.

## Task 3: Defend the changed packaging decision (15 minutes)

The requested release changes to the Harbour briefing. The build context must remain `starter`; the server
configuration and public URLs must stay unchanged; no supplied file may be moved or edited.

| Input relative to the fixed context | Meaning |
|---|---|
| `public/index.html` and `public/site.css` | Previous North gate release and its asset |
| `delivery/blue/page/index.html` | Requested Harbour page, which asks for `site.css` at the public root |
| `shared/site.css` | Requested stylesheet, separate from the requested page directory |
| `delivery/blue/internal/briefing.txt` | A test fixture that must not be copied into the server's document tree or served |

Before editing, state the mapping from selected sources to the two required image paths and URLs. Decide whether the
guided directory-copy approach can be reused unchanged, and reject one plausible alternative by a concrete observable
consequence (missing asset, previous release, wrong public path or exposed fixture). Predict which image-file, request
and forbidden-path assertions it would fail. Then revise the same Dockerfile and run:

```bash
python3 lab.py test --variant changed --tag localhost/academy-w105:changed
```

## Task 4: Separate source, tag and running evidence (10 minutes)

Compare the image IDs printed for `core` and `changed`. Add an evidence tag and inspect both names:

```bash
docker image tag localhost/academy-w105:core localhost/academy-w105:kept
docker image inspect localhost/academy-w105:core
docker image inspect localhost/academy-w105:kept
```

Predict what a new container from `:kept` serves after the changed image has been built, then test it with an owned
container or `docker run --rm --entrypoint cat localhost/academy-w105:kept /usr/share/nginx/html/index.html`. Finish
`evidence.md`. Delete only the temporary containers you created; retain the Dockerfile and image IDs.

## Acceptance criteria

- [ ] The unedited starter builds/starts, and its expected application failure is retained.
- [ ] The core Dockerfile builds a tagged image serving exact North gate HTML and its asset.
- [ ] The final Dockerfile uses the fixed context to serve exact Harbour HTML and shared CSS at `/` and `/site.css`, without copying or serving the internal fixture.
- [ ] A predicted failure distinguishes a plausible wrong copy/context choice from the successful recipe.
- [ ] Actual image contents, requests, tag-to-image identity and startup behaviour are recorded, with owned containers cleaned up.
- [ ] Each learner explains which instruction supplies a visible file and how startup is inherited.

## Hints

<details><summary>Hint 1: Identify the failing observation</summary>

Compare the printed URL and expected source file with the actual release text. A 200 status proves a response arrived;
it does not identify the requested release. If the page is right but its stylesheet check fails, inspect the page and
asset inputs separately.
</details>

<details><summary>Hint 2: Trace both path roots</summary>

Mark the fixed context root and the server's document root. Trace each selected source from the first root, then trace
the URL to the second. A recipe under a subdirectory does not move either root. Check which unwanted files a directory
copy would include.
</details>

<details><summary>Hint 3: Complete one operation, then check its scope</summary>

Start with this partly completed, non-runnable operation for the required page destination:
`COPY <your-selected-context-relative-source> /usr/share/nginx/html/index.html`. It does not specify the stylesheet
operation; decide that mapping separately and explain whether your operations could also copy the internal fixture.
</details>

## Individual evidence

Choose one visible file from your changed-release evidence. Name its source in the fixed context, its destination in
the image and the instruction responsible. Explain how the image starts NGINX without a new `CMD`. Predict what a fresh
container from the saved core tag will serve and name the image observation that checks it.

## Transfer (paper)

An equipment team supplies an updated notice in one directory and its approved stylesheet in another. The public
notice URL must remain unchanged, and an internal maintenance note must not appear in the served directory. Which
source-to-image relationships must you establish, and which observation would reveal that a broad copy exposed more
than the approved notice? Use a path table or spoken mapping; do not write another Dockerfile.

## Knowledge check (8 minutes)

1. A build runs `docker build -f deploy/Web.Dockerfile -t notice:one release`. The recipe contains `COPY page/index.html /usr/share/nginx/html/index.html`. Which source must exist?
   A. `deploy/page/index.html`, because the recipe is in deploy. B. `release/page/index.html`, because release is the selected context. C. `/usr/share/nginx/html/page/index.html` on the host. D. `release/deploy/Web.Dockerfile/page/index.html`.
2. The endpoint uses image B. Image A contains the earlier page and stylesheet; B the revised page and stylesheet. The owner approves the revised page but requires the earlier stylesheet. Only A and B exist; you may select either image but may not build or change container files. What should you recommend?
   A. Select A because rolling back also preserves the approved revised page. B. Keep B because successful requests prove every supplied file is approved. C. Hold the release and request permission to build and verify an image containing the approved page and stylesheet combination. D. Rename B's tag to describe the earlier stylesheet, then release it.
3. A Dockerfile has FROM and COPY only. The base records `/docker-entrypoint.sh` and `nginx -g 'daemon off;'`. A new container serves the copied page. Which explanation accounts for startup?
   A. COPY executes the HTML file as a server. B. The browser starts NGINX when it requests the URL. C. Every image without CMD automatically runs a web server. D. FROM selected a base whose startup configuration the application image inherited.
4. The current tag selects image B. An older container still serves the earlier page, but no earlier tag was saved. A colleague needs a separate temporary run of that earlier image; the container and tag must stay unchanged and rebuilding is forbidden. Which plan works?
   A. Inspect the older container's image ID, then run that exact ID with a new owned name and free host port. B. Run the current tag with a new name. C. Reassign the current tag to the earlier image, then use it. D. Stop the existing container and rebuild a replacement from today's source under its name.
5. An image serves the intended page at `/`. The HTML requests `/site.css`. The desired stylesheet exists at `/usr/share/nginx/html/assets/site.css`, and `/assets/site.css` succeeds. Public URLs must stay unchanged. Which correction meets that constraint?
   A. Ignore the stylesheet because the page's HTTP status is 200. B. Put the selected stylesheet at the image path corresponding to `/site.css`, then rebuild and verify that request. C. Change only the host publishing port from 8105 to 8106. D. Rename the image tag to include the word assets.

## Recovery and accessible evidence

Save your current Dockerfile and failed output outside `starter` before receiving a checkpoint; the checkpoint restores
the core release only. A failure during COPY points to context or source availability; a successful build followed by
a welcome page points to the served image and destination; a correct page with a failing stylesheet points to that
asset path. Oral explanation, a text path table or a terminal transcript can replace drawings or screenshots. Do not
run a global image or container prune; remove only your named browser containers.

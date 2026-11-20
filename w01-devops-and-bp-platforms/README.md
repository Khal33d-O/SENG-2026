# Week 1: DevOps and BP Platforms

Week 1 follows one small application — the treasure-hunt **foundation** page and board API — from a browser request
to source control, container images, configuration, a CI/CD pipeline, Kubernetes/GitOps and observability, and finishes
with Project 1, a reproducible deployment through classroom GitOps. BP-specific platform actions (Yalla scaffolding,
BP pull requests and deployments) are **pending**: the approved walkthrough has not been supplied, so every lab uses a
clearly labelled local route.

## Sessions

| Id | Session | Lab | Worked examples |
|---|---|---|---|
| W1.01 | DevOps and application architecture | [labs/w1-01](labs/w1-01/README.md) | [examples/w1-01](examples/w1-01/README.md) |
| W1.02 | Git fundamentals | [labs/w1-02](labs/w1-02/README.md) | [examples/w1-02](examples/w1-02/README.md) |
| W1.03 | Guided branches and pull requests | [labs/w1-03](labs/w1-03/README.md) | [examples/w1-03](examples/w1-03/README.md) |
| W1.04 | Introduction to Docker | [labs/w1-04](labs/w1-04/README.md) | [examples/w1-04](examples/w1-04/README.md) |
| W1.05 | Dockerfiles and image builds | [labs/w1-05](labs/w1-05/README.md) | [examples/w1-05](examples/w1-05/README.md) |
| W1.06 | Container configuration and networking | [labs/w1-06](labs/w1-06/README.md) | [examples/w1-06](examples/w1-06/README.md) |
| W1.07 | CI/CD and container checks | [labs/w1-07](labs/w1-07/README.md) | [examples/w1-07](examples/w1-07/README.md) |
| W1.08 | Guided Kubernetes and GitOps | [labs/w1-08](labs/w1-08/README.md) | [examples/w1-08](examples/w1-08/README.md) |
| W1.09 | Prepare a platform deployment (BP items pending) | [labs/w1-09](labs/w1-09/README.md) | [examples/w1-09](examples/w1-09/README.md) |
| W1.10 | Project preparation: deployment checks and observability | [labs/w1-10](labs/w1-10/README.md) | [examples/w1-10](examples/w1-10/README.md) |
| P1 | Project 1: Deploy the game foundation (540 min) | [projects/p1](projects/p1/README.md) | — |

The W1.10 / P1 application lives in [`projects/code/app`](projects/code/README.md) (so the Project 1 command
`cp -R ../code/app ...` works from `projects/p1`). W1.01 and W1.04 use the simpler `foundation-a` release in
`labs/w1-01/starter/supplied-runtime` (W1.04 builds it into `localhost/academy-w104:10.0.12`).

## Prerequisites and tool versions

| Tool | Course version | Used in |
|---|---|---|
| Git | 2.47+ (rehearsed with 2.47.3) | W1.02, W1.03, W1.07, W1.08, P1 |
| Python 3 | 3.13.5 (standard library; PyYAML 6.0.2 for W1.08) | helpers in W1.02–W1.10 |
| .NET SDK | 10.0.401, target `net10.0` (`global.json` rolls forward from 10.0.100) | W1.01, W1.06 image, W1.10, P1 |
| Container engine | Docker, or Podman 5.4.2+ as the prepared local alternative | W1.01, W1.04–W1.07, W1.10, P1 |
| Trivy | 0.74.0 with a prepared database | W1.07 |
| Kubernetes / Argo CD | kubectl 1.35.5, Argo CD 3.5.2 (classroom) | W1.08 (local mock available), P1 |
| Loki / Grafana | `grafana/loki:3.7.8`, `grafana/grafana:13.2.3` (prepared images) | W1.10, P1 |
| Browser | Chromium (Python Playwright optional for the W1.10 helper) | all |
| Node.js | 22.23.2 (diagnostic only) | W1.01 |

Pinned base images: `nginx:1.30.4-trixie`, `nginx:1.30.4-alpine3.24`, `dotnet/aspnet:10.0.12`, `dotnet/sdk:10.0.401`, each
by digest in the recipes. No account, credential or BP tenant is needed for any local route.

## How the labs are organised

* `labs/w1-0N/README.md` — the lab brief: timing, outcomes, supplied vs owned files, setup, tasks, acceptance criteria,
  staged hints, individual evidence, knowledge-check questions, recovery and teardown.
* Files the book names live where the book's commands expect them (e.g. `code/starter/prepare.py`, `lab.py`,
  `pipeline.py`, `code/lab.py`, `starter/run.py`). Each lab has an evidence template (`evidence.md`, or `notes.md` in W1.01).
* `examples/w1-0N/` — the instructor's worked examples, runnable, with the book's commands.
* Helpers print every engine/Git command they run, refuse to overwrite existing workspaces, and clean up only what
  they created. Never run engine-wide prune commands or remove another learner's resources.
* Use supplied materials, documentation and human/access support without generated answers for first attempts and
  individual evidence; record assistance separately from a passing check.

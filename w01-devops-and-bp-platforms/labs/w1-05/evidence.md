# W1.05 evidence

Learner label: ____  Partner: ____  Engine: ____  Live / captured: ____

## Task 1: inputs and baseline
* Build context / base / inherited startup (from `docker image inspect`):
* Why the starter builds and runs before it includes the application:
* Prediction (base page or North gate?) and actual baseline + test-core results; one image ID:

## Task 2: core image
* My COPY instruction(s), source path (from the context) and destination:
* Build + `lab.py test --variant core` result; tag and image ID:
* Copy of the working recipe saved as `evidence-core.Dockerfile`: yes / no

## Task 3: changed release
| Required URL | Image path | Selected source (context-relative) | Instruction |
|---|---|---|---|
| `/` | | | |
| `/site.css` | | | |
* Rejected alternative and its predicted failing assertions (image file / request / forbidden path):
* Actual `--variant changed` result vs prediction:

## Task 4: tags and running evidence
* Image IDs: core ____ changed ____ kept ____
* Prediction for a new container from `:kept`, and the observation that tested it:
* Why an already running core container keeps its image:

## Individual explanation and assistance
* One visible file: source → destination → instruction:
* How NGINX starts without a new CMD:
* Assistance used / next revisit:
* Containers removed:

# W1.08 annotations (copied into your workspace by init; complete it there)

Back end used: classroom / LOCAL MOCK    Live / captured: ____

## Field annotations
| Field group | Owning resource (kind/name) | Value | Intended effect | Confirming observation |
|---|---|---|---|---|
| Main image | Deployment main-page, template container page | | | |
| Pod labels | Deployment template metadata | | | |
| Service selector | Service page | | | |
| Service port / targetPort | Service page | | | |
| ConfigMap value | ConfigMap page-settings | | | |

Crossplane (wider platform context, not configured here):

## Prediction before the image change
* Effect on the Pod template and running Pods:
* Evidence needed for the Service response:
* An observation that would disprove the expected user-visible result:

## Trace
| Observation | Initial (A) | After image change | After correction |
|---|---|---|---|
| Git revision (full) | | | |
| Argo sync / health / operation | | | |
| main-page image / available | | | |
| preview-page image / available | | | |
| Service selector | | | |
| Selected endpoint Pod | | | |
| That Pod's labels and runtime image ID | | | |
| Service response (page title) | | | |

## Correction
* Field, intended value and the observation it should change (before editing):
* Rejected alternative and the confirmed observation it would leave unchanged:

## Individual explanation, assistance, revisit
* Declared / applied / ran / returned, in my words:
* Rolling-update scenario (two ready endpoints, old and new): does one response establish completion? Next evidence:
* Assistance used: ____  Revisit in W1.10: ____

# W2.05 evidence card: browser events and rendering from state

Learner id (synthetic, e.g. `learner-01`): ______  Partner id: ______

## Retrieval prediction
- After East, South: position ____, score ____, moves ____. Which input changes state; which reaches the rule without changing it?

## Task 1: guided East repair
- Diagnostics before the repair (position, moves, rule calls) vs the marked tile:
- The two statements in execution order, and why a second rule call would not "refresh":

## Tasks 2-3: shared dispatch
- Initial observation, chosen edit, expected result:
- The statement that retains the rule result:
- East vs ArrowRight, South vs ArrowDown from fresh resets (state and call count):
- West from the start: evidence that the request was rejected rather than unregistered:

## Task 4: changed final approach (BEFORE running)
| Step | Predicted state | Predicted feedback |
|---|---|---|
| Final approach loaded | | |
| South (button) | | |
| South (key) | | |
| New game | | |
- My "Last move" condition in words:
- Text-update arrangement and why no obsolete warning can survive:
- Rejected alternative and a concrete case where its message would mislead:
- Observed results and any revision:

## Task 5: usability
- `npm test` result:
- Focus visible after Enter/Space; calls per activation:
- Blocked move compared field by field; repeated keydown (0 calls) vs blocked direction (1 call):

## Individual evidence
- One button event from selection and registration through callback, direction, rule call, retained state and visible result (an accepted or blocked move with values):
- My coordinates change to the feedback, checked on an accepted and a blocked move:

## Transfer: stock-request quantity
- Increase then ArrowUp from two: retained value and display; the shared action's two operations; diagnosis of a label stuck at two; where typing in the notes should leave the path:

## Assistance
- independent / prompted / guided / not yet demonstrated; environment blocked (separately):

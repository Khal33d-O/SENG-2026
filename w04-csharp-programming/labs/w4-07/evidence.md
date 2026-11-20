# W4.07 evidence template

Learner: `learner-__` · Partner who drove commands (if any): ____

## 1. Prediction (before running)
Classify: west from start ____ · missing direction ____ · reading element 1 of a one-element array ____
`fault`: predicted `index` ____ and `Length` ____

## 2. Reproduction
Command: ____
Exception and first frame in our own source (file:line): ____
Debugger stop: breakpoint line ____ · `index` = ____ · `board.Treasures.Length` = ____ · caller ____
What happened on Step Over: ____

## 3. Repairs (before/after)
`TreasureLabel` change and why it now prints `t1`: ____
`Apply` change: ____

## 4. Observed outcomes
| Mode | Command | Output (boundary, after, rule engine reason) | Exit code |
|---|---|---|---|
| fault | | | |
| invalid | | | |
| missing | | | |
| west | | | |
| east | | | |
| unexpected | | | |

## 5. Explanation
Invariant (rejection spends no move, state unchanged): ____
Why a broad `catch` would be misleading: ____
Missing direction vs null trusted board: ____

## 6. Help used
____

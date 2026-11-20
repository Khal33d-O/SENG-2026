# W2.05 captured demonstration observations

Author-captured evidence for when the live environment is unavailable. It records what was observed with
the reference adapter; it does not count as your execution. Mark execution checks unperformed.

## Worked Example 1 (Button event demonstration)
- Initial output: `No event received`.
- Click the nested label once: `Events received: 1 · type: click · current target: inspect-button · target: label`.
- Tab to the button, press Enter: `Events received: 2 · type: click · current target: inspect-button · target: inspect-button`.
- Reload: `No event received`.

## Worked Example 2 (Shared action demonstration)
- Start: `Lantern charges: 2`. Click "Use lantern": `1`. Press L: `0`. Press L again: `0`.
- Reload, press L first: `1`.

## Starter adapter, guided observation
- East once, Read diagnostics: position (1,0), movesRemaining 5, moveRuleCalls 1; board still marks (0,0);
  status `playing: 6 moves left`.

## Changed case (open only after recording your prediction)
Final approach, Read diagnostics: `{ position: (2,0), movesRemaining: 2, score: 10, collected: ["t1"], status: "playing" }`, 0 calls.

| Step | Board | Status text (reference adapter) |
|---|---|---|
| Final approach | Player at (2,0) | `playing: 2 moves left` |
| South (button) | Player at (2,1) | `playing: 1 moves left - Last move` |
| South (ArrowDown) | Player at (2,2) | `won: 0 moves left` (2 rule calls in total) |
| New game | Player at (0,0) | `playing: 6 moves left` |

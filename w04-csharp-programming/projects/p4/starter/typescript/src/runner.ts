// TypeScript comparison runner: prints ONE line of JSON for a fixture file.
// Usage: node typescript/src/runner.ts fixtures/F02.json      (Node 24 runs .ts directly)
//    or: node typescript/dist/runner.js fixtures/F02.json     (after `npm run build` with tsc 5.9.3)
// It always uses the fixed reference board next to the fixture (board-reference.json).
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { evaluate, initialState, type Board, type GameState, type MoveAction } from "./rules.ts";

interface Fixture {
  id: string;
  board?: string;
  state: GameState | null;
  action?: MoveAction | null;
  actions?: (MoveAction | null)[];
}

const path = process.argv[2];
if (!path) {
  console.error("Usage: node typescript/src/runner.ts <fixture.json>");
  process.exit(2);
}
const fixture = JSON.parse(readFileSync(path, "utf8")) as Fixture;
const board = JSON.parse(
  readFileSync(join(dirname(path), `board-${fixture.board ?? "reference"}.json`), "utf8"),
) as Board;

let outcome: { accepted: boolean | null; reason: string | null; state: GameState };
if (fixture.actions && fixture.actions.length > 0) {
  // Learner-authored sequence: each action applies to the previous returned state.
  let current = fixture.state ?? initialState(board);
  let last = null;
  for (const action of fixture.actions) {
    last = evaluate(board, current, action);
    current = last.state;
  }
  outcome = { accepted: last!.accepted, reason: last!.reason ?? null, state: last!.state };
} else if (fixture.state === null) {
  outcome = { accepted: null, reason: null, state: initialState(board) };
} else {
  const result = evaluate(board, fixture.state, fixture.action ?? null);
  // Adapter: normalise an omitted reason to JSON null so both languages expose the same fields.
  outcome = { accepted: result.accepted, reason: result.reason ?? null, state: result.state };
}
console.log(JSON.stringify(outcome));

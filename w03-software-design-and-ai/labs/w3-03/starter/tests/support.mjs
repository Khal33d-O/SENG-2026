// Supplied test support (W3.03). Do not edit.
// `code` is the compiled rule module under test: ../dist/rules.js by default. The facilitator's replay
// sets W303_RULES to a prepared variant's compiled file; your tests do not need to know which one.
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';

export const code = await import(process.env.W303_RULES ? pathToFileURL(process.env.W303_RULES).href : '../dist/rules.js');

// Starts from a FRESH initial state, runs each action in order (passing each returned state into the
// next call), checks that no call mutated its input, and returns the final public state.
// It does not decide expected values or select your paths.
export function runPath(actions) {
  let state = code.initialState();
  for (const direction of actions) {
    const before = structuredClone(state);
    const result = code.evaluateMove(state, direction);
    assert.deepEqual(state, before, `evaluateMove(${direction}) must not mutate its input`);
    state = result.state;
  }
  return state;
}

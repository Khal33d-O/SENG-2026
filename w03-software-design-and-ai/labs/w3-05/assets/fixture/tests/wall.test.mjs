// Unchanged wall/state regression (W3.05 bound check). Expectations come from the contract.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateMove, initialState } from '../dist/rules.js';

test('east then rejected south preserves the complete public state', () => {
  const state = evaluateMove(initialState(), 'east').state;
  const before = structuredClone(state);
  const result = evaluateMove(state, 'south');
  assert.equal(result.accepted, false, 'wall action is rejected');
  assert.deepEqual(result.state, {
    position: { x: 1, y: 0 }, movesRemaining: 5, score: 0, collected: [], status: 'playing',
  }, 'rejection preserves five moves and every other public field');
  assert.deepEqual(state, before, 'caller input is preserved');
});

test('accepted moves still cost one, including collecting t1', () => {
  const afterEast = evaluateMove(initialState(), 'east').state;
  assert.deepEqual(evaluateMove(afterEast, 'east').state, {
    position: { x: 2, y: 0 }, movesRemaining: 4, score: 10, collected: ['t1'], status: 'playing',
  });
});

// Fixed independent checks (W3.04). Expectations come from contract.md and the board, not from the rule.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateMove, initialState } from '../dist/rules.js';

const playing = (x, y, movesRemaining, score = 0, collected = []) =>
  ({ position: { x, y }, movesRemaining, score, collected, status: 'playing' });

test('wall rejection after east preserves the complete state', () => {
  const state = evaluateMove(initialState(), 'east').state;
  const result = evaluateMove(state, 'south');
  assert.equal(result.accepted, false);
  assert.deepEqual(result.state, playing(1, 0, 5), 'east then rejected south keeps five moves');
});

test('boundary rejection at the start preserves the complete state', () => {
  const result = evaluateMove(initialState(), 'north');
  assert.equal(result.accepted, false);
  assert.deepEqual(result.state, playing(0, 0, 6));
});

test('an accepted move costs exactly one', () => {
  const result = evaluateMove(initialState(), 'east');
  assert.equal(result.accepted, true);
  assert.deepEqual(result.state, playing(1, 0, 5));
});

test('collecting treasure costs one move and records t1 once', () => {
  const afterEast = evaluateMove(initialState(), 'east').state;
  const result = evaluateMove(afterEast, 'east');
  assert.deepEqual(result.state, playing(2, 0, 5, 10, ['t1']), 'East, East reaches t1 with five moves');
});

test('a final-move win counts before the zero-budget loss', () => {
  const result = evaluateMove(playing(2, 1, 1, 10, ['t1']), 'south');
  assert.deepEqual(result.state, { position: { x: 2, y: 2 }, movesRemaining: 0, score: 10, collected: ['t1'], status: 'won' });
});

// Supplied single-session checks (complete). Path: controlled save response -> real decoder ->
// real session -> real rule -> session snapshot. Only the external save service is controlled.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { openSession } from '../dist/session.js';
import { controlledResponses } from '../dist/responses.js';
import { evaluateMove, initialState } from '../dist/rules.js';

const START = { position: { x: 0, y: 0 }, movesRemaining: 6, score: 0, collected: [], status: 'playing' };

test('direct: the rule alone keeps five moves after east then rejected south', () => {
  const afterEast = evaluateMove(initialState(), 'east').state;
  assert.equal(evaluateMove(afterEast, 'south').state.movesRemaining, 5);
});

test('integration: a loaded session retains an accepted move and preserves it after the wall', async () => {
  const service = controlledResponses(START);
  const game = await openSession('slot-1', service);
  assert.deepEqual(service.requestedSlots, ['slot-1'], 'setup: the opener asked for this slot');
  game.move('east');
  const afterEast = { position: { x: 1, y: 0 }, movesRemaining: 5, score: 0, collected: [], status: 'playing' };
  assert.deepEqual(game.snapshot(), afterEast, 'accepted move retained in the session snapshot');
  const result = game.move('south');
  assert.equal(result.accepted, false);
  assert.deepEqual(game.snapshot(), afterEast, 'rejected wall action preserves the public state');
});

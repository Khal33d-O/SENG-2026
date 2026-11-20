// Five boundary checks: a real loopback HTTP request through askForHint -> server -> handleHint ->
// requestHint -> supplied guard. Only the model response is controlled (deterministic stub).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createHost } from '../dist/server.js';
import { fixedClient } from '../dist/clients.js';
import { initialState } from '../dist/rules.js';
import { askForHint } from '../browser/client.mjs';

const EAST = { action: { type: 'move', direction: 'east' }, explanation: 'Explore the open eastern square.' };

async function exchange(response, state) {
  const client = fixedClient(response);
  const server = createHost({ clientFor: () => ({ client }) });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    const body = { boardId: 'reference', state, stateVersion: 0 };
    const before = structuredClone(body);
    const envelope = await askForHint(body, { baseUrl: `http://127.0.0.1:${server.address().port}` });
    assert.deepEqual(body, before, 'the posted state is unchanged');
    return { envelope, calls: client.calls };
  } finally {
    server.close();
  }
}

test('boundary: the initial state sends the documented payload and returns the model hint', async () => {
  const { envelope, calls } = await exchange(EAST, initialState());
  assert.deepEqual(calls, [{
    context: { boardId: 'reference', position: { x: 0, y: 0 }, movesRemaining: 6 },
    allowedActions: [{ type: 'move', direction: 'east' }, { type: 'move', direction: 'south' }],
  }]);
  assert.deepEqual(envelope.hint, EAST);
  assert.equal(envelope.source, 'model');
  assert.match(envelope.requestId, /^hint-/, 'the server created the request identifier');
});

test('boundary: at (2,1) the unchanged east stub falls back to north with a new identifier', async () => {
  const first = await exchange(EAST, initialState());
  const state = { position: { x: 2, y: 1 }, movesRemaining: 3, score: 10, collected: ['t1'], status: 'playing' };
  const { envelope, calls } = await exchange(EAST, state);
  assert.deepEqual(calls[0].allowedActions, [{ type: 'move', direction: 'north' }, { type: 'move', direction: 'south' }]);
  assert.deepEqual(envelope.hint, { action: { type: 'move', direction: 'north' }, explanation: 'A permitted next move.' });
  assert.equal(envelope.source, 'fallback');
  assert.notEqual(envelope.requestId, first.envelope.requestId, 'each request keeps its own identifier');
});

test('boundary: a permitted but irrelevant explanation passes the mechanical guard', async () => {
  const bananas = { action: { type: 'move', direction: 'east' }, explanation: 'Bananas are yellow.' };
  const { envelope } = await exchange(bananas, initialState());
  assert.equal(envelope.source, 'model', 'the guard does not measure usefulness; a person must');
  assert.deepEqual(envelope.hint, bananas);
});

test('boundary: extra response fields are omitted from the public hint', async () => {
  const { envelope } = await exchange({ ...EAST, internalScore: 0.9, debug: 'trace' }, initialState());
  assert.deepEqual(envelope.hint, EAST);
});

test('boundary: a completed game returns no hint and skips the model call', async () => {
  const won = { position: { x: 2, y: 2 }, movesRemaining: 2, score: 10, collected: ['t1'], status: 'won' };
  const { envelope, calls } = await exchange(EAST, won);
  assert.equal(envelope.hint, null);
  assert.equal(calls.length, 0);
});

// make timeout: a supplied hanging stub reaches the handler and triggers the reference two-second timeout.
import { handleHint, REFERENCE_TIMEOUT_MS } from '../dist/handler.js';
import { hangingClient } from '../dist/clients.js';
import { initialState } from '../dist/rules.js';

const body = { boardId: 'reference', state: initialState(), stateVersion: 0 };
const before = structuredClone(body);
const client = hangingClient();
const started = Date.now();
const envelope = await handleHint(body, { requestId: 'request-timeout-demo', client });
console.log(JSON.stringify(envelope, null, 2));
console.log(`client calls: ${client.calls.length}; waited about ${((Date.now() - started) / 1000).toFixed(1)} s (reference timeout ${REFERENCE_TIMEOUT_MS} ms)`);
console.log(`input state unchanged: ${JSON.stringify(body) === JSON.stringify(before)}`);
console.log(envelope.source === 'fallback' && envelope.requestId === 'request-timeout-demo'
  ? 'PASS timeout returns the permitted fallback with the same identifier'
  : 'FAIL unexpected timeout result');

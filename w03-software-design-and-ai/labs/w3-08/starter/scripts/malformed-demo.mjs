// make malformed: the prepared transport returns the literal text {not json. The configured
// HTTPS-shaped URL is never contacted: the supplied transport returns the malformed local response.
import { handleHint } from '../dist/handler.js';
import { textTransport, transportClient } from '../dist/clients.js';
import { initialState } from '../dist/rules.js';

const body = { boardId: 'reference', state: initialState(), stateVersion: 0 };
const before = structuredClone(body);
const client = transportClient(textTransport('{not json'));
const envelope = await handleHint(body, { requestId: 'request-H03-malformed', client });
console.log(JSON.stringify(envelope, null, 2));
console.log(`attempted client calls: ${client.calls.length}`);
console.log(`game state unchanged: ${JSON.stringify(body) === JSON.stringify(before)}`);

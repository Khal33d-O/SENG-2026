// Supplied local hint server (the Week 3 hint handler, packaged for Week 5).
//
//   POST /api/hint  { board, state, stateVersion }
//     -> 200 { hint: { action: { type: "move", direction }, explanation } | null, source, requestId }
//   (the Week 3 W3.07 envelope: a Hint is an action plus an explanation)
//   GET  /healthz   ->  200 Healthy
//
// The .NET API is the only caller: it sends the stored, authoritative board and state.
// The "model" is a deterministic simulation selected with HINT_MODE; no live provider or key is used:
//   success     the simulated model suggests a permitted direction (validated, source "model")
//   validation  the simulated model answers with an impossible direction (fails validation -> fallback)
//   timeout     the simulated model answers after the deadline (-> fallback)
// Fallback: the first permitted direction in N, E, S, W order, or null. Advice never changes state.
import http from 'node:http';
import { DIRECTIONS, evaluate } from './treasure-rules.mjs';

const PORT = Number(process.env.HINT_PORT ?? 5056);
const MODE = process.env.HINT_MODE ?? 'success';
const DEADLINE_MS = Number(process.env.HINT_DEADLINE_MS ?? 400);
const ORDER = ['north', 'east', 'south', 'west'];
const MAX_EXPLANATION = 160; // JavaScript string units, as in W3.07
const move = (direction) => ({ type: 'move', direction });

if (!['success', 'validation', 'timeout'].includes(MODE)) {
  console.error(`Unknown HINT_MODE '${MODE}'. Use success, validation or timeout.`);
  process.exit(2);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Directions the rules accept from this state, in N, E, S, W order. */
export function permittedDirections(board, state) {
  if (state.status !== 'playing') return [];
  return ORDER.filter((direction) => evaluate(board, state, { type: 'move', direction }).accepted);
}

/** Simulated model. Deterministic per mode so classroom evidence is repeatable. */
async function simulatedModel(board, state, permitted) {
  if (MODE === 'timeout') {
    await sleep(DEADLINE_MS * 4);
    return { direction: permitted[0] ?? null, explanation: 'Late answer.' };
  }
  if (MODE === 'validation') {
    return { direction: 'up', explanation: 'Simulated invalid answer.' };
  }
  // success: head towards the next uncollected treasure, otherwise the exit.
  const target = board.treasures.find((t) => !state.collected.includes(t.id)) ?? board.exit;
  const distance = (x, y) => Math.abs(target.x - x) + Math.abs(target.y - y);
  const here = distance(state.position.x, state.position.y);
  const closer = permitted.find((d) => {
    const { dx, dy } = DIRECTIONS[d];
    return distance(state.position.x + dx, state.position.y + dy) < here;
  });
  const direction = closer ?? permitted[0] ?? null;
  const goal = target === board.exit ? 'the exit' : 'the treasure';
  return { direction, explanation: `Simulated model: ${direction} moves you closer to ${goal}.` };
}

/** Runtime gate (W3.07): shape and legality only; explanation non-empty, at most 160 string units.
 * Usefulness is a separate human judgement. */
function validate(answer, permitted) {
  return answer !== null && typeof answer === 'object'
    && typeof answer.direction === 'string' && permitted.includes(answer.direction)
    && typeof answer.explanation === 'string' && answer.explanation.length > 0 && answer.explanation.length <= MAX_EXPLANATION;
}

async function advise(board, state) {
  const permitted = permittedDirections(board, state);
  const answer = await Promise.race([simulatedModel(board, state, permitted), sleep(DEADLINE_MS).then(() => 'TIMEOUT')]);
  if (answer !== 'TIMEOUT' && validate(answer, permitted)) {
    return { hint: { action: move(answer.direction), explanation: answer.explanation }, source: 'model' };
  }
  const why = answer === 'TIMEOUT' ? 'simulated model timed out' : 'simulated model answer failed validation';
  const first = permitted[0] ?? null;
  // No permitted direction: hint is null (nothing to advise).
  return { hint: first ? { action: move(first), explanation: `Fallback (${why}): ${first} is the first permitted direction in N, E, S, W order.` } : null, source: 'fallback' };
}

function send(res, status, body, requestId) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'X-Request-Id': requestId });
  res.end(JSON.stringify({ ...body, requestId }));
}

const server = http.createServer(async (req, res) => {
  const requestId = String(req.headers['x-request-id'] ?? `hint-${Date.now()}`);
  if (req.method === 'GET' && req.url === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Healthy');
    return;
  }
  if (req.method !== 'POST' || req.url !== '/api/hint') {
    send(res, 404, { code: 'NOT_FOUND', message: 'Unknown route' }, requestId);
    return;
  }
  let raw = '';
  for await (const chunk of req) raw += chunk;
  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    send(res, 400, { code: 'INVALID_REQUEST', message: 'Body must be JSON.' }, requestId);
    return;
  }
  if (!body?.board || !body?.state?.position) {
    send(res, 400, { code: 'INVALID_REQUEST', message: 'Expected { board, state, stateVersion }.' }, requestId);
    return;
  }
  const result = await advise(body.board, body.state);
  // Bounded metadata only: no board or state contents in the log.
  console.log(JSON.stringify({ ts: new Date().toISOString(), requestId, mode: MODE, source: result.source,
    direction: result.hint?.action.direction ?? null, stateVersion: body.stateVersion ?? null }));
  send(res, 200, result, requestId);
});

server.listen(PORT, '127.0.0.1', () => console.log(`Hint server (simulated model mode: ${MODE}) on http://127.0.0.1:${PORT}`));

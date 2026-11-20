// HTTP client for the session API. All paths are relative and same-origin.

/**
 * Supplied request helper: sends fetch, awaits the response, reads JSON and throws on a
 * non-success status. A fulfilled fetch promise is not HTTP success: a 409 still resolves fetch.
 */
export async function request(path, body, fail = false) {
  const headers = { Accept: 'application/json' };
  const init = { method: body === undefined ? 'GET' : 'POST', headers };
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(body);
  }
  if (fail) headers['X-Training-Failure'] = 'after-write';

  const response = await fetch(path, init);
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(data?.message ?? `HTTP ${response.status}`);
    error.status = response.status;
    error.code = data?.code ?? 'HTTP_ERROR';
    error.requestId = data?.requestId ?? response.headers.get('X-Request-Id');
    throw error;
  }
  return data;
}

export async function getBoard() {
  return await request('/api/boards/reference');
}

export async function createSession() {
  return await request('/api/sessions', { boardId: 'reference' });
}

export async function loadSession(sessionId) {
  return await request(`/api/sessions/${encodeURIComponent(sessionId)}`);
}

/** Sends only the action; the server loads the authoritative state and decides the outcome. */
export async function sendAction(sessionId, direction, fail = false) {
  // >>> W5.03 owned: sendAction
  // TODO W5.03: await request with the session action path and an action-only body.
  throw new Error('EXERCISE_INCOMPLETE: complete sendAction in client.js');
  // <<< W5.03 owned
}

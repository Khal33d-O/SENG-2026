// YOU OWN THIS FUNCTION (W3.07). Keep its signature.
// Select the documented model context (boardId, position x/y, movesRemaining) and the documented
// action fields (type, direction); call the injected client ONCE; await its actual hint; return
// { hint, source: 'model', requestId } with the current request identifier. Do not mutate input.
// The request identifier stays out of the model payload. Fallback belongs to the supplied handler.
import type { Envelope, HintInput, ModelClient } from './contracts.js';

export async function requestHint(input: HintInput, client: ModelClient): Promise<Envelope> {
  void input;
  void client;
  throw new Error('requestHint is not implemented yet (W3.07 missing-implementation error)');
}

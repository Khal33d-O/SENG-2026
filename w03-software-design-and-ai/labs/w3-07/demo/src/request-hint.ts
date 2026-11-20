// Complete demonstration for the CLEAN nested inputs (W3.07 worked example 2). It passes the two
// function examples and five boundary checks; the changed nested input is the challenge.
import type { Envelope, HintInput, ModelClient } from './contracts.js';
export async function requestHint(input: HintInput, client: ModelClient): Promise<Envelope> {
  const hint = await client({
    context: { boardId: input.game.boardId, position: { ...input.game.position },
    movesRemaining: input.game.movesRemaining },
    allowedActions: input.allowedActions.map(action => ({ ...action }))
  });
  return { hint, source: 'model', requestId: input.requestId };
}

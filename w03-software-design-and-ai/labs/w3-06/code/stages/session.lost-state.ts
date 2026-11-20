// BROKEN STAGE (harness only): the session calls the rule but forgets to retain the returned state.
import { decodeSave } from './decoder.js';
import type { SaveService } from './responses.js';
import { evaluateMove, type Direction, type MoveResult, type State } from './rules.js';

export interface Session {
  move(direction: Direction): MoveResult;
  snapshot(): State;
}

export async function openSession(slot: string, service: SaveService): Promise<Session> {
  const response = await service.load(slot);
  const state = decodeSave(await response.text());
  return {
    move(direction) {
      return structuredClone(evaluateMove(state, direction)); // returned state is never kept
    },
    snapshot() {
      return structuredClone(state);
    },
  };
}

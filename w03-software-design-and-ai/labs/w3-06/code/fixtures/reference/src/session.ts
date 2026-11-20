// Supplied session: loads a save through the decoder and keeps its own state, applying the real rule.
import { decodeSave } from './decoder.js';
import type { SaveService } from './responses.js';
import { evaluateMove, type Direction, type MoveResult, type State } from './rules.js';

export interface Session {
  move(direction: Direction): MoveResult;
  snapshot(): State;
}

export async function openSession(slot: string, service: SaveService): Promise<Session> {
  const response = await service.load(slot);
  let state = decodeSave(await response.text()); // owned by this session only
  return {
    move(direction) {
      const result = evaluateMove(state, direction);
      state = result.state; // retain the rule's returned state
      return structuredClone(result);
    },
    snapshot() {
      return structuredClone(state);
    },
  };
}

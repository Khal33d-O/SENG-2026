// BROKEN STAGE (harness only): every live session shares one module-level state.
import { decodeSave } from './decoder.js';
import type { SaveService } from './responses.js';
import { evaluateMove, type Direction, type MoveResult, type State } from './rules.js';

export interface Session {
  move(direction: Direction): MoveResult;
  snapshot(): State;
}

let current: State; // shared by every session in this process

export async function openSession(slot: string, service: SaveService): Promise<Session> {
  const response = await service.load(slot);
  current = decodeSave(await response.text()); // opening a session overwrites the others
  return {
    move(direction) {
      const result = evaluateMove(current, direction);
      current = result.state;
      return structuredClone(result);
    },
    snapshot() {
      return structuredClone(current);
    },
  };
}

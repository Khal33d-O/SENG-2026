// Supplied decoder: turns saved JSON text into a game state, rejecting malformed saves.
import type { State } from './rules.js';

const STATUSES = ['playing', 'won', 'lost'];

export function decodeSave(text: string): State {
  const data: unknown = JSON.parse(text);
  if (typeof data !== 'object' || data === null || Array.isArray(data)) throw new TypeError('save must be an object');
  const save = data as Record<string, unknown>;
  const position = save.position as Record<string, unknown> | undefined;
  if (!position || !Number.isInteger(position.x) || !Number.isInteger(position.y)) throw new TypeError('save needs an integer position');
  if (!Number.isInteger(save.movesRemaining) || typeof save.score !== 'number') throw new TypeError('save needs movesRemaining and score');
  if (!Array.isArray(save.collected) || !save.collected.every((c) => typeof c === 'string')) throw new TypeError('save needs collected ids');
  if (typeof save.status !== 'string' || !STATUSES.includes(save.status)) throw new TypeError('save has an unknown status');
  return {
    position: { x: position.x as number, y: position.y as number },
    movesRemaining: save.movesRemaining as number,
    score: save.score,
    collected: [...(save.collected as string[])],
    status: save.status as State['status'],
  };
}

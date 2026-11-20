// W2.03 lab challenge: select valid neighbouring positions.
//
// Contract: a tile qualifies when
//   * its coordinates are inside the board,
//   * it is exactly one horizontal or vertical step from `from`, and
//   * its id has a stored access value of true (a stored false or a missing key
//     does not grant permission).
// Return the qualifying tiles in candidate-array order, as the original tile
// objects inside a NEW array. Do not modify tiles, from, board or access.
// `cost` is retained data; it is not an eligibility rule in this request.
//
// Keep the signature and the imports: the public tests call this function.
import type { Board, Position, Tile } from './model.js';
import { inside, stepDistance } from './supplied.js';

export function neighbours(
  tiles: Tile[],
  from: Position,
  board: Board,
  access: Map<string, boolean>
): Tile[] {
  // TODO (Task 2): replace this callable placeholder with your selection.
  // Use an explicit loop or a typed filter callback. The helpers inside and
  // stepDistance are imported for you.
  return [];
}

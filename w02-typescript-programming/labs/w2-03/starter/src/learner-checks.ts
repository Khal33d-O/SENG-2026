// Task 4: your own diagnostic inputs for `npm run check:mine`.
//
// Rival bounds rule to expose: "For a board of width w, a tile with x === w is
// still inside."
//
// The values below are an UNFINISHED TEMPLATE. They start with a square board
// and an origin only so that the template is callable. Replace them with:
//   * a rectangular board (width !== height) that differs from the public fixtures,
//   * a valid origin inside that board,
//   * access entries for your tile ids,
//   * a normal example that retains at least one tile, and
//   * a boundary example where the rival rule and the correct rule disagree
//     about one disputed tile while every other eligibility condition holds.
// Record your predictions in evidence.md BEFORE running npm run check:mine.
import type { Board, Position, Tile } from './model.js';

export const board: Board = { width: 3, height: 3 };

export const origin: Position = { x: 0, y: 0 };

export const access: Map<string, boolean> = new Map<string, boolean>();

export const normalInput: Tile[] = [];
export const normalExpected: string[] = [];

export const boundaryInput: Tile[] = [];
export const boundaryExpected: string[] = [];

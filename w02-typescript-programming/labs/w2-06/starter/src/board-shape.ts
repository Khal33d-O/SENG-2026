// Supplied: the wire shape and its nested runtime guard. Read the contract; do not rewrite it.
//
// isBoardShape(value) establishes:
//   * id is "reference"; width and height are positive integers;
//   * start, exit, every wall and every treasure have integer x/y inside the board;
//   * walls and treasures are arrays; every treasure has a non-empty string id;
//   * initialMoves is a number.
// It does NOT establish that initialMoves is a usable starting allowance,
// and it checks each point on its own: it never compares treasures with walls.
// Solvability and unique IDs are outside this exercise.

export interface WirePoint {
  x: number;
  y: number;
}

export interface WireTreasure extends WirePoint {
  id: string;
}

// Wire data uses initialMoves (the local model calls it initialMoveBudget).
export interface WireBoard {
  id: "reference";
  width: number;
  height: number;
  start: WirePoint;
  walls: WirePoint[];
  treasures: WireTreasure[];
  exit: WirePoint;
  initialMoves: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

function isPointInside(value: unknown, width: number, height: number): value is WirePoint {
  if (!isRecord(value)) return false;
  const x = value.x;
  const y = value.y;
  return (
    typeof x === "number" && Number.isInteger(x) && x >= 0 && x < width &&
    typeof y === "number" && Number.isInteger(y) && y >= 0 && y < height
  );
}

function isTreasureInside(value: unknown, width: number, height: number): value is WireTreasure {
  if (!isRecord(value) || !isPointInside(value, width, height)) return false;
  const id = value.id;
  return typeof id === "string" && id.length > 0;
}

// A true result narrows an unknown value to WireBoard.
export function isBoardShape(value: unknown): value is WireBoard {
  if (!isRecord(value)) return false;
  const { id, width, height, start, walls, treasures, exit, initialMoves } = value;
  if (id !== "reference") return false;
  if (!isPositiveInteger(width) || !isPositiveInteger(height)) return false;
  if (!isPointInside(start, width, height) || !isPointInside(exit, width, height)) return false;
  if (!Array.isArray(walls) || !walls.every((wall) => isPointInside(wall, width, height))) return false;
  if (!Array.isArray(treasures) || !treasures.every((t) => isTreasureInside(t, width, height))) return false;
  return typeof initialMoves === "number";
}

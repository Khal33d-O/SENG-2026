// A tile on the collection board: a unique id, numeric coordinates and a
// finite, non-negative cost. Shared by the complete conversion example and
// by the seeded rule in costly.ts.
export interface Tile {
  id: string;
  x: number;
  y: number;
  cost: number;
}

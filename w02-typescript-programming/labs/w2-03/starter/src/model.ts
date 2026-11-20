// Supplied type aliases. A type alias names an object shape; it does not
// create an object or validate data read from a file.

/** A position on the board. Coordinates are zero-based integers. */
export type Position = {
  x: number;
  y: number;
};

/** Board dimensions. Valid x values are 0 .. width - 1, valid y values 0 .. height - 1. */
export type Board = {
  width: number;
  height: number;
};

/** A candidate tile: an identifier and a cost added to a pair of coordinates. */
export type Tile = {
  id: string;
  x: number;
  y: number;
  cost: number;
};

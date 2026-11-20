// Public outcomes for neighbours(tiles, from, board, access).
// Every case and expectation is here: there are no secret eligibility rules.
// Do NOT edit these fixtures to match your output.
//
// Coordinates are zero-based: valid x is 0 .. width - 1, valid y is 0 .. height - 1.
// `access` lists [id, value] entries; the tests build a fresh Map from them.
// An id with no entry is a MISSING key, which does not grant permission.

export const cases = [
  {
    name: 'interior',
    board: { width: 5, height: 4 },
    from: { x: 2, y: 1 },
    tiles: [
      { id: 'amber', x: 3, y: 1, cost: 2 },
      { id: 'basalt', x: 3, y: 2, cost: 1 },
      { id: 'cedar', x: 2, y: 0, cost: 4 },
      { id: 'dune', x: 2, y: 1, cost: 1 },
      { id: 'elm', x: 1, y: 1, cost: 3 },
      { id: 'flint', x: 2, y: 2, cost: 2 },
      { id: 'garnet', x: 4, y: 1, cost: 5 }
    ],
    access: [
      ['amber', true],
      ['basalt', true],
      ['cedar', true],
      ['dune', true],
      ['elm', false],
      ['garnet', true]
    ],
    expected: ['amber', 'cedar']
  },
  {
    name: 'corner',
    board: { width: 4, height: 3 },
    from: { x: 0, y: 0 },
    tiles: [
      { id: 'hazel', x: -1, y: 0, cost: 1 },
      { id: 'iris', x: 0, y: 1, cost: 2 },
      { id: 'jade', x: 1, y: 1, cost: 1 },
      { id: 'kelp', x: 0, y: -1, cost: 3 },
      { id: 'larch', x: 1, y: 0, cost: 2 }
    ],
    access: [
      ['hazel', true],
      ['iris', true],
      ['jade', true],
      ['kelp', true],
      ['larch', true]
    ],
    expected: ['iris', 'larch']
  },
  {
    name: 'upper-boundary',
    board: { width: 4, height: 3 },
    from: { x: 3, y: 2 },
    tiles: [
      { id: 'maple', x: 4, y: 2, cost: 1 },
      { id: 'nickel', x: 3, y: 1, cost: 2 },
      { id: 'onyx', x: 3, y: 3, cost: 1 },
      { id: 'pearl', x: 2, y: 2, cost: 3 }
    ],
    access: [
      ['maple', true],
      ['nickel', true],
      ['onyx', true],
      ['pearl', true]
    ],
    expected: ['nickel', 'pearl']
  },
  {
    name: 'missing-permission',
    board: { width: 3, height: 3 },
    from: { x: 1, y: 1 },
    tiles: [
      { id: 'quartz', x: 1, y: 0, cost: 1 },
      { id: 'reed', x: 0, y: 1, cost: 2 },
      { id: 'slate', x: 2, y: 1, cost: 1 },
      { id: 'teak', x: 1, y: 2, cost: 2 }
    ],
    access: [
      ['reed', false],
      ['slate', true],
      ['umber', true]
    ],
    expected: ['slate']
  },
  {
    name: 'empty',
    board: { width: 3, height: 2 },
    from: { x: 0, y: 0 },
    tiles: [],
    access: [['amber', true]],
    expected: []
  },
  {
    name: 'no-valid',
    board: { width: 3, height: 3 },
    from: { x: 1, y: 1 },
    tiles: [
      { id: 'violet', x: 0, y: 0, cost: 1 },
      { id: 'willow', x: 1, y: 1, cost: 1 },
      { id: 'xenon', x: 1, y: 0, cost: 2 },
      { id: 'yarrow', x: 2, y: 1, cost: 2 },
      { id: 'zinc', x: 3, y: 1, cost: 1 }
    ],
    access: [
      ['violet', true],
      ['willow', true],
      ['xenon', false],
      ['zinc', true]
    ],
    expected: []
  }
];

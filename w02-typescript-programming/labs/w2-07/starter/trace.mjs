// SUPPLIED trace option. traced(rule) returns a function that behaves exactly like
// rule. When the TRACE environment variable is 1, it prints the threshold and
// tile costs immediately before the actual rule call. It does not calculate an
// expected result and does not modify the fixture.
//
//   bash / Git Bash / macOS:  TRACE=1 npm run check:probe
//   PowerShell:               $env:TRACE='1'; npm run check:probe; Remove-Item Env:TRACE
export function traced(rule, label = 'costly') {
  return (tiles, threshold) => {
    if (process.env.TRACE === '1') {
      const costs = tiles.map((tile) => `${tile.id}:${tile.cost}`).join(', ');
      console.log(`TRACE ${label} received threshold=${threshold} tiles=[${costs}]`);
    }
    return rule(tiles, threshold);
  };
}

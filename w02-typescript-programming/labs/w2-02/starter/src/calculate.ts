// W2.02 lab: calculate a state preview.
//
// SUPPLIED: the exported wrapper line, its parameter names, the parameter and
// return types, and the final `return state;` line. Keep all of them.
// The runner (tools/show.mjs, the tests and the browser report) calls
// calculate(initial, requested, points) once per public case in cases.mjs.
//
// YOU OWN: the statements between the two BODY markers.
//   - initial    the before-state; a comparison panel keeps a reference to it
//   - requested  how many score-bearing actions the player asks for (0-6)
//   - points     points added by each permitted action (1-5)

export function calculate(
  initial: { score: number; actionsRemaining: number; completed: boolean },
  requested: number,
  points: number,
): { score: number; actionsRemaining: number; completed: boolean } {
  // ---- BODY START (your statements go here) ----

  // Starter baseline: no calculation yet. This line does not construct an
  // object; it retains a second reference to the caller's object.
  let state = initial;

  // ---- BODY END ----
  return state;
}

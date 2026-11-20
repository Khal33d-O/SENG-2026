// LEARNER-OWNED (Task 4): your executable acceptance evidence.
// `npm run plan` starts a FRESH session from the public start using plan.json,
// runs completionActions and checks the fixed completion outcome (status won at the
// exit with every treasure collected). It then runs invalidExample.prefix in another
// fresh session, applies invalidExample.action and compares EVERY state field with
// the before state. It accepts any supported plan by behaviour and budget.

import type { Direction } from "./rules.js";

export interface InvalidExample {
  /** Actions from the public start that build the setup (Given). */
  prefix: Direction[];
  /** The operation being assessed (When). It must be rejected while still playing (Then). */
  action: Direction | null;
}

// Completion witness: the public-start sequence that reaches the finish.
// Initially empty, so `npm run plan` fails with an explicit missing-evidence assertion.
export const completionActions: Direction[] = [];

// Invalid-action example: explain its setup before you fill it in.
export const invalidExample: InvalidExample = {
  prefix: [],
  action: null,
};

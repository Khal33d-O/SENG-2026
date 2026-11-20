# Hint 1: locate the promise

Sort what you read into three piles before writing an assertion:

- **Board facts** (`src/board.ts`, the fixed specification): sizes, wall, treasure, exit, six moves.
- **Public observations**: the complete returned state — position, movesRemaining, score, collected, status.
- **Production code** (`src/rules.ts`): explains why a branch produced a value; it is not the authority for
  what the value should be.

Your expected values must come from the first pile.

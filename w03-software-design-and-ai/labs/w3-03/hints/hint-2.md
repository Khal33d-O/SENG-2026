# Hint 2: inspect an intermediate position

Write the coordinates after each step of an accepted path, for example east → (1,0), east → (2,0)...
At an intermediate square, list each direction's destination and whether the board makes it legal.
A destination with x or y outside 0–2, or equal to (1,1), is rejected by the specification.

Then ask: would an evaluator that never moves at all make your two runs agree? If yes, equality alone
cannot be the whole specification.

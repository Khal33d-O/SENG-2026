// The stored-operation caller (supplied: inspect; preserve the implementation and the counter).
// subscribe stores an operation and returns a port. Registration performs no movement.
// Each later send increments the port's call count once, then invokes the stored operation once.
import type { Direction } from "./rules.js";

export type Operation = (direction: Direction) => void;

export interface Port {
  readonly calls: number;
  send(direction: Direction): void;
}

export function subscribe(operation: Operation): Port {
  let calls = 0;
  return {
    get calls() {
      return calls;
    },
    send(direction: Direction): void {
      calls += 1;
      // The actual invocation expression: a plain call with no object to the left of it.
      operation(direction);
    },
  };
}

// Guided practice (owned by you): a small non-game example of instance ownership.
export class VisitCounter {
  #count: number;

  // Supplied: each instance keeps its own chosen initial value.
  constructor(initial: number) {
    this.#count = initial;
  }

  // TODO (guided practice): add one to the receiving instance's count.
  // Use this.#count; do not use a shared static or a variable outside the instance.
  increment(): void {}

  // Supplied observation method.
  value(): number {
    return this.#count;
  }
}

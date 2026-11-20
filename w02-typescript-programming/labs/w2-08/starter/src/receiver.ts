// Scalar receiver example (supplied): `this` comes from the actual invocation, not from the source text.
export interface Labelled {
  label: string;
  describe(): string;
}

export const north: Labelled = {
  label: "North",
  describe() {
    return this.label;
  },
};

// The same function value, stored on a different object.
export const south: Labelled = { label: "South", describe: north.describe };

// Deliberately NOT compiled (outside src/). Copy into src/ to see the diagnostic:
// error TS2741: Property 'value' is missing in type '{ label: string; }' but required in type 'Counter'.
interface Counter {
  label: string;
  value: number;
}
const wrong: Counter = { label: "visits" };

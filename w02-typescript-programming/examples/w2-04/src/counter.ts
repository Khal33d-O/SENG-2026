// What are interfaces? The interface checks the literal; it creates nothing at runtime.
interface Counter {
  label: string;
  value: number;
}
const counter: Counter = { label: "visits", value: 4 };
console.log(counter); // { label: 'visits', value: 4 }

// Run one compiled example from dist/src, or all of them: npm run example -- models
const all = ["retrieve", "counter", "switch", "models", "caller", "boundary", "ui/caller"];
const wanted = process.argv[2];
for (const name of wanted ? [wanted] : all) {
  if (!all.includes(name)) { console.error(`Unknown example ${name}. Choose: ${all.join(", ")}`); process.exit(1); }
  console.log(`--- ${name}`);
  await import(`../dist/src/${name}.js`);
}

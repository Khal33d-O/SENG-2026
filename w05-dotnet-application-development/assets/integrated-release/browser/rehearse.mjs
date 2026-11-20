// Supplied browser checker (Chromium via Playwright), called by run.py rehearse:
//   node rehearse.mjs <baseUrl> <hintMode>
// Plays the reference game through the real page: start, East, rejected South (display and GET
// unchanged), hint (no movement), then East/South/South to win with score 10; Load session agrees.
import { chromium } from 'playwright';

const [base, mode = 'success'] = process.argv.slice(2);
const expectedSource = mode === 'success' ? 'model' : 'fallback';
let failures = 0;

function check(condition, message) {
  console.log(`  ${condition ? 'ok  ' : 'FAIL'} browser: ${message}`);
  if (!condition) failures += 1;
}

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.goto(base);
  const field = (name) => page.locator(`[data-field="${name}"]`).innerText();
  const shown = async () => ({ position: await field('position'), moves: await field('movesRemaining'),
    score: await field('score'), collected: await field('collected'), status: await field('status') });
  const idle = () => page.waitForSelector('#busy', { state: 'hidden' });
  const click = async (selector) => { await page.click(selector); await idle(); };
  const stored = () => page.evaluate(async () => {
    const id = document.querySelector('#session-id').value;
    return (await (await fetch(`/api/sessions/${id}`)).json()).state;
  });

  await page.waitForSelector('.cell');
  await click('#new-game');
  check((await field('position')) === '(0,0)', 'New game shows (0,0)');

  await click('[data-direction="east"]');
  const afterEast = await shown();
  check(afterEast.position === '(1,0)' && afterEast.moves === '5' && afterEast.score === '0', 'East renders (1,0), five moves, score 0');

  await click('[data-direction="south"]');
  const error = await page.locator('#error').innerText();
  check(error.includes('ILLEGAL_ACTION') && error.includes('request '), `South shows ILLEGAL_ACTION with a request ID (${error})`);
  check(JSON.stringify(await shown()) === JSON.stringify(afterEast), 'display unchanged after the rejected South');
  const s = await stored();
  check(s.position.x === 1 && s.position.y === 0 && s.movesRemaining === 5, 'independent GET unchanged after the rejected South');

  await click('#hint');
  const hint = await page.locator('#hint-result').innerText();
  check(hint.includes(`(${expectedSource})`), `hint source ${expectedSource} (${hint})`);
  check(JSON.stringify(await shown()) === JSON.stringify(afterEast), 'hint did not move the player');

  for (const d of ['east', 'south', 'south']) await click(`[data-direction="${d}"]`);
  const won = await shown();
  check(won.status === 'won' && won.score === '10' && won.position === '(2,2)', 'East, South, South: won with score 10 at (2,2)');
  const final = await stored();
  check(final.status === 'won' && final.score === 10, 'subsequent GET agrees: won, score 10');

  await click('#load-session');
  check(JSON.stringify(await shown()) === JSON.stringify(won), 'Load session shows the same confirmed state');
} finally {
  await browser.close();
}
console.log(failures === 0 ? 'PASS browser checks' : `FAIL browser checks (${failures})`);
process.exit(failures === 0 ? 0 : 1);

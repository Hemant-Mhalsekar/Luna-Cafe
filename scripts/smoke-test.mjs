#!/usr/bin/env node
/**
 * Checks a deployed Lunaa Café site end to end, through the same address visitors use.
 * Usage: node scripts/smoke-test.mjs https://your-site.vercel.app
 *
 * The API on Render's free plan may be asleep, so the health check waits up to two minutes.
 */
const base = (process.argv[2] ?? '').replace(/\/$/, '');
if (!/^https?:\/\//.test(base)) {
  console.error('Usage: node scripts/smoke-test.mjs https://your-site.vercel.app');
  process.exit(1);
}

let failures = 0;
const ok = (msg) => console.log(`  ✓ ${msg}`);
const fail = (msg) => {
  failures++;
  console.log(`  ✗ ${msg}`);
};
const check = (cond, msg, detail = '') => (cond ? ok(msg) : fail(detail ? `${msg} (${detail})` : msg));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(path) {
  const res = await fetch(base + path, { redirect: 'manual', signal: AbortSignal.timeout(90_000) });
  const type = res.headers.get('content-type') ?? '';
  const body = type.includes('json') ? await res.json().catch(() => null) : await res.text();
  return { res, body };
}

console.log(`\nLuna Café smoke test: ${base}\n`);

console.log('Site (Vercel)');
const home = await get('/');
check(home.res.status === 200, 'home page loads', `status ${home.res.status}`);
check(typeof home.body === 'string' && home.body.includes('Lunaa Café'), 'home page has the café name');
const deep = await get('/games');
check(deep.res.status === 200 && String(deep.body).includes('<div id="root">'), 'deep links fall back to the app (/games)');
const admin = await get('/admin');
check(admin.res.headers.get('x-robots-tag')?.includes('noindex'), 'admin pages are marked noindex');
const csp = home.res.headers.get('content-security-policy') ?? '';
check(csp.includes("frame-ancestors 'none'"), 'security headers are set');
const asset = String(home.body).match(/\/assets\/[^"']+\.js/)?.[0];
if (asset) {
  const a = await fetch(base + asset);
  check(a.headers.get('cache-control')?.includes('immutable'), 'built assets are cached long-term');
}

console.log('\nAPI through the /api rewrite (Render)');
let health;
for (let i = 0; i < 12; i++) {
  try {
    health = await get('/api/health');
    if (health.res.status === 200) break;
  } catch {
    // Render is still waking up.
  }
  if (i === 0) console.log('  … waiting for the API to wake up (free plan), up to 2 minutes');
  await sleep(Number(process.env.SMOKE_WAIT_MS ?? 10_000));
}
check(health?.res.status === 200, 'API is up and connected to MongoDB', health ? `status ${health.res.status}, ${JSON.stringify(health.body)}` : 'no answer');

if (health?.res.status === 200) {
  const games = await get('/api/games');
  check(games.body?.games?.length > 0, `games are seeded (${games.body?.games?.length ?? 0})`, 'run npm --prefix server run seed');
  const menu = await get('/api/menu');
  check(menu.body?.items?.length > 0, `menu is seeded (${menu.body?.items?.length ?? 0})`);
  const events = await get('/api/events');
  check(Array.isArray(events.body?.events), `events load (${events.body?.events?.length ?? 0} upcoming)`);
  const me = await get('/api/auth/me');
  check(me.res.status === 401, 'admin API is locked without a session');
}

console.log(failures === 0 ? '\nAll good. The café is open.\n' : `\n${failures} check(s) failed.\n`);
process.exit(failures === 0 ? 0 : 1);

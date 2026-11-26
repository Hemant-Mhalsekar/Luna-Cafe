// Pre-renders each public page to its own HTML file after `vite build`, so search engines and link
// previews get real content without running JavaScript. The browser then attaches to it (hydrates).
//
// dist/index.html            → the home page
// dist/<page>.html           → /games, /menu, /events, /about, /contact, /book (vercel.json routes them)
// dist/app.html              → the empty app shell, served for every other address (admin, 404s)
//
// On Vercel (VERCEL=1) the menu, games and events are fetched from the live API and baked in.
// Elsewhere (local builds, CI, e2e) pages are rendered without data, so tests never see live data.
import { readFile, writeFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const PAGES = ['/', '/games', '/menu', '/events', '/about', '/contact', '/book'];
// Pages whose first screen depends on today's date: pre-rendered for crawlers, but the browser
// renders them fresh instead of attaching, so a build from yesterday never shows yesterday.
const RENDER_FRESH = new Set(['/book']);
const API = process.env.PRERENDER_API ?? 'https://luna-cafe.onrender.com/api';
const bake = process.env.PRERENDER_DATA ? process.env.PRERENDER_DATA === '1' : process.env.VERCEL === '1';

const { render } = await import(join(root, 'dist-server', 'entry-server.js'));
const shell = await readFile(join(dist, 'index.html'), 'utf8');
// The shell is served for every address that has no page of its own (admin, unknown links):
// keep those out of search results.
await writeFile(
  join(dist, 'app.html'),
  shell.replace('content="index, follow"', 'content="noindex, follow"').replace(/\s*<link rel="canonical"[^>]*>/, ''),
);

/** GET with patience: the free API may take up to a minute to wake. Gives up quietly. */
async function get(path, tries = 8) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(`${API}${path}`, { signal: AbortSignal.timeout(20_000) });
      if (res.ok) return await res.json();
      if (![502, 503, 504].includes(res.status)) return undefined;
    } catch {
      // asleep or unreachable: wait and try again
    }
    await new Promise((r) => setTimeout(r, 5_000));
  }
  return undefined;
}

let data = {};
if (bake) {
  const [menu, games, events, special] = await Promise.all([get('/menu'), get('/games'), get('/events'), get('/menu/special')]);
  data = { menu: menu?.items, games: games?.games, events: events?.events, special };
  const got = Object.entries(data).filter(([, v]) => v !== undefined).map(([k]) => k);
  console.log(`[prerender] baked in from the API: ${got.join(', ') || 'nothing (API unreachable; pages render without data)'}`);
} else {
  console.log('[prerender] rendering without live data (set PRERENDER_DATA=1 to bake it in)');
}

for (const path of PAGES) {
  const { html, head, state } = await render(path, data);
  const page = shell
    .replace(/<!--seo-->[\s\S]*?<!--\/seo-->/, head)
    .replace('<div id="root"></div>', `<div id="root" data-route="${RENDER_FRESH.has(path) ? '' : path}">${html}</div>${state}`);
  const file = path === '/' ? 'index.html' : `${path.slice(1)}.html`;
  await writeFile(join(dist, file), page);
  console.log(`[prerender] ${path} → dist/${file} (${(page.length / 1024).toFixed(0)} KB)`);
}

const today = new Date().toISOString().slice(0, 10);
const site = 'https://lunaacafe.vercel.app';
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PAGES.map((p) => `  <url><loc>${site}${p === '/' ? '/' : p}</loc><lastmod>${today}</lastmod><changefreq>${p === '/events' ? 'daily' : 'weekly'}</changefreq><priority>${p === '/' ? '1.0' : '0.8'}</priority></url>`).join('\n')}
</urlset>
`;
await writeFile(join(dist, 'sitemap.xml'), sitemap);
await rm(join(root, 'dist-server'), { recursive: true, force: true });
console.log('[prerender] wrote dist/sitemap.xml');

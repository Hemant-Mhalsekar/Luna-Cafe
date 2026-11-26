// Server entry used only at build time to pre-render each public page to HTML (scripts/prerender.mjs).
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router';
import { QueryClient, QueryClientProvider, dehydrate } from '@tanstack/react-query';
import { routes } from './router';
import { OG_IMAGE, canonicalFor, cafeJsonLd, seoFor, SITE_URL } from './lib/seo';
import type { Game, MenuItem, PublicEvent } from './lib/types';

export interface BuildData {
  menu?: MenuItem[];
  games?: Game[];
  events?: PublicEvent[];
  special?: unknown;
}

const PAGE_DATA: Record<string, (keyof BuildData)[]> = {
  '/': ['special'],
  '/games': ['games'],
  '/menu': ['menu'],
  '/events': ['events'],
  '/book': ['games'],
};

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// JSON inside <script>: stop "</script>" (and friends) from closing the tag early.
const safeJson = (v: unknown) => JSON.stringify(v).replace(/</g, '\\u003c');

/** Renders one page. Returns the app HTML, the head tags and the data to pass to the browser. */
export async function render(path: string, data: BuildData) {
  const handler = createStaticHandler(routes);
  const context = await handler.query(new Request(`${SITE_URL}${path}`));
  if (context instanceof Response) throw new Error(`Unexpected redirect while rendering ${path}`);
  const router = createStaticRouter(handler.dataRoutes, context);

  const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity, retry: false } } });
  // Mark the build-time data as old straight away, so the browser refreshes it after the first paint.
  const seed = (key: unknown[], value: unknown) => value !== undefined && queryClient.setQueryData(key, value, { updatedAt: 1 });
  // Only the data this page shows, so each HTML file stays small.
  const uses = PAGE_DATA[path] ?? [];
  if (uses.includes('menu')) seed(['menu'], data.menu);
  if (uses.includes('games')) seed(['games'], data.games);
  if (uses.includes('events')) seed(['events'], data.events);
  if (uses.includes('special')) seed(['menu', 'special'], data.special);

  const html = renderToString(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <StaticRouterProvider router={router} context={context} hydrate={false} />
      </QueryClientProvider>
    </StrictMode>,
  );

  const page = seoFor(path);
  const url = canonicalFor(path);
  const jsonLd: unknown[] = [cafeJsonLd()];
  if (path === '/events' && data.events?.length) {
    for (const e of data.events) {
      jsonLd.push({
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: e.title,
        description: e.description,
        startDate: `${e.date}T${e.startTime}:00+05:30`,
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        location: { '@type': 'Place', name: 'Lunaa Café', address: cafeJsonLd().address },
        organizer: { '@type': 'Organization', name: 'Lunaa Café', url: `${SITE_URL}/` },
        offers: {
          '@type': 'Offer',
          price: 0,
          priceCurrency: 'INR',
          url: `${SITE_URL}/events`,
          availability: e.spotsLeft > 0 ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
        },
        image: OG_IMAGE,
      });
    }
  }

  const head = [
    `<title>${esc(page.title)}</title>`,
    `<meta name="description" content="${esc(page.description)}" />`,
    `<meta name="robots" content="${page.noindex ? 'noindex' : 'index, follow'}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Lunaa Café" />`,
    `<meta property="og:locale" content="en_IN" />`,
    `<meta property="og:title" content="${esc(page.title)}" />`,
    `<meta property="og:description" content="${esc(page.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${OG_IMAGE}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="Lunaa Café: Coffee first. Then game on?" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(page.title)}" />`,
    `<meta name="twitter:description" content="${esc(page.description)}" />`,
    `<meta name="twitter:image" content="${OG_IMAGE}" />`,
    `<script type="application/ld+json">${safeJson(jsonLd.length === 1 ? jsonLd[0] : jsonLd)}</script>`,
  ].join('\n    ');

  const hasData = queryClient.getQueryCache().getAll().length > 0;
  const state = hasData ? `<script type="application/json" id="query-state">${safeJson(dehydrate(queryClient))}</script>` : '';
  return { html, head, state };
}

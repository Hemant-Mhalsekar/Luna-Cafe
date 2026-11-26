import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router/dom';
import { matchRoutes } from 'react-router';
import { QueryClient, QueryClientProvider, hydrate } from '@tanstack/react-query';
import '@fontsource/fredoka/500.css';
import '@fontsource/fredoka/600.css';
import '@fontsource-variable/dm-sans';
import '@fontsource/fragment-mono/400.css';
import './index.css';
import { createRouter, routes } from './router';
import { retryWhileWaking, wakeRetryDelay } from './lib/api';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, retry: retryWhileWaking, retryDelay: wakeRetryDelay, refetchOnWindowFocus: false },
  },
});

const container = document.getElementById('root')!;
const app = (router: ReturnType<typeof createRouter>) => (
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
);

async function start() {
  // Pages are pre-rendered to HTML at build time (scripts/prerender.mjs). When this HTML was made for
  // exactly the address we are on, attach to it (hydrate); otherwise (admin, filters in the URL, old
  // builds) start fresh.
  const here = location.pathname + location.search;
  const prerendered = container.dataset.route === here && container.hasChildNodes();

  // Load the code for this page's lazy routes first, so nothing flashes a loading state.
  for (const match of matchRoutes(routes, location) ?? []) {
    const route = match.route;
    if (route.lazy && typeof route.lazy === 'function') {
      Object.assign(route, await route.lazy());
      delete route.lazy;
    }
  }

  if (!prerendered) {
    container.replaceChildren();
    createRoot(container).render(app(createRouter()));
    return;
  }

  // Data the page was built with (menu, games, events), so the first render matches the HTML.
  const state = document.getElementById('query-state')?.textContent;
  if (state) hydrate(queryClient, JSON.parse(state));
  hydrateRoot(container, app(createRouter()));
}

void start();

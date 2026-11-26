// Search and share tags for each public page. One source for both the pre-rendered HTML
// (scripts/prerender.mjs) and the live app (RouteSeo updates the tags when you change page).
import { CAFE } from './cafe';

export const SITE_URL = 'https://lunaacafe.vercel.app';
export const OG_IMAGE = `${SITE_URL}/og.jpg`;

export interface PageSeo {
  title: string;
  description: string;
  /** Kept out of search results (still works for visitors). */
  noindex?: boolean;
}

const suffix = ` · ${CAFE.name}`;

export const PAGES: Record<string, PageSeo> = {
  '/': {
    title: `${CAFE.name} · Specialty coffee and board games in Panaji, Goa`,
    description:
      'Specialty coffee, fresh bakes and a shelf of over 100 board games in Panaji, Goa. Book a table, find a game with our quiz, or join a game night.',
  },
  '/games': {
    title: `Board game library: 100+ games to play${suffix}`,
    description:
      'Browse our board game library by players, time and mood, or take the ten-second quiz to find your game. Free to play with any order.',
  },
  '/menu': {
    title: `Menu: coffee, tea, bakes and snacks${suffix}`,
    description:
      'Signature lattes, chai, cold brew, fresh croissants and things to share. Vegan and gluten-free options marked. Prices include taxes.',
  },
  '/events': {
    title: `Game nights and tournaments${suffix}`,
    description: 'Upcoming game nights and board game tournaments at Lunaa Café, Panaji. Save a free seat online; your first drink is on us.',
  },
  '/about': {
    title: `About us and FAQ${suffix}`,
    description:
      'The story of Lunaa Café, the team behind the bar and the game shelf, and answers to common questions about bookings, games and groups.',
  },
  '/contact': {
    title: `Contact and directions${suffix}`,
    description: 'Opening hours, address and how to reach Lunaa Café in Panaji, Goa. Send us a note for groups, birthdays and private events.',
  },
  '/book': {
    title: `Book a table${suffix}`,
    description: 'Reserve a table for up to eight at Lunaa Café. Tables are held for 90 minutes, and you can reserve a board game too.',
  },
};

export const NOT_FOUND: PageSeo = { title: `Page not found${suffix}`, description: PAGES['/'].description, noindex: true };

export function seoFor(path: string): PageSeo {
  return PAGES[path] ?? NOT_FOUND;
}

export function canonicalFor(path: string): string {
  return path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`;
}

/** Updates the head tags in place (client side, on every page change). */
export function applySeo(path: string) {
  const page = seoFor(path);
  document.title = page.title;
  const set = (selector: string, attr: string, value: string) => {
    const el = document.head.querySelector(selector);
    if (el) el.setAttribute(attr, value);
  };
  set('meta[name="description"]', 'content', page.description);
  set('meta[property="og:title"]', 'content', page.title);
  set('meta[property="og:description"]', 'content', page.description);
  set('meta[property="og:url"]', 'content', canonicalFor(path));
  set('meta[name="twitter:title"]', 'content', page.title);
  set('meta[name="twitter:description"]', 'content', page.description);
  set('link[rel="canonical"]', 'href', canonicalFor(path));
  set('meta[name="robots"]', 'content', page.noindex ? 'noindex' : 'index, follow');
}

/** Facts about the café for Google (schema.org). */
export function cafeJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'CafeOrCoffeeShop',
    name: CAFE.name,
    slogan: CAFE.tagline,
    description: PAGES['/'].description,
    url: `${SITE_URL}/`,
    image: OG_IMAGE,
    email: CAFE.email,
    telephone: CAFE.phone.replace(/\s/g, ''),
    servesCuisine: ['Coffee', 'Tea', 'Bakery'],
    priceRange: '₹₹',
    acceptsReservations: true,
    menu: `${SITE_URL}/menu`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: CAFE.address[0],
      addressLocality: 'Panaji',
      addressRegion: 'Goa',
      addressCountry: 'IN',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '10:00',
        closes: '22:00',
      },
    ],
  };
}

import { describe, expect, it } from 'vitest';
import { NAV_LINKS } from './cafe';
import { PAGES, canonicalFor, cafeJsonLd, seoFor } from './seo';

describe('page tags', () => {
  it('every page in the menu bar has its own title and description', () => {
    for (const { to } of NAV_LINKS) {
      expect(PAGES[to], to).toBeDefined();
      expect(PAGES[to].noindex).toBeFalsy();
    }
    const titles = Object.values(PAGES).map((p) => p.title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it('keeps titles and descriptions within what search results show', () => {
    for (const [path, page] of Object.entries(PAGES)) {
      expect(page.title.length, path).toBeLessThanOrEqual(65);
      expect(page.description.length, path).toBeGreaterThanOrEqual(70);
      expect(page.description.length, path).toBeLessThanOrEqual(160);
    }
  });

  it('keeps unknown addresses out of search results', () => {
    expect(seoFor('/no-such-page').noindex).toBe(true);
  });

  it('builds absolute canonical links', () => {
    expect(canonicalFor('/')).toBe('https://lunaacafe.vercel.app/');
    expect(canonicalFor('/menu')).toBe('https://lunaacafe.vercel.app/menu');
  });

  it('describes the café for Google with hours and address', () => {
    const ld = cafeJsonLd();
    expect(ld['@type']).toBe('CafeOrCoffeeShop');
    expect(ld.openingHoursSpecification[0].dayOfWeek).not.toContain('Monday');
    expect(ld.address.addressCountry).toBe('IN');
  });
});

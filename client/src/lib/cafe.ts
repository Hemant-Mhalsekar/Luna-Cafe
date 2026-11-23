// Café facts shown across the site. Keep in sync with server/src/lib/cafe.ts.
export const CAFE = {
  name: 'Luna Café',
  tagline: 'Coffee first. Then game on?',
  address: ['14 Crescent Lane', 'Moonbeam Quarter, Panaji, Goa'],
  email: 'hello@lunacafe.example',
  phone: '+91 98765 43210',
  hours: [
    { days: 'Tuesday – Sunday', time: '10:00 – 22:00' },
    { days: 'Monday', time: 'Closed (we are resting our dice)' },
  ],
} as const;

export const NAV_LINKS = [
  { to: '/games', label: 'Games' },
  { to: '/menu', label: 'Menu' },
  { to: '/events', label: 'Events' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
] as const;

/**
 * Hero photo. Leave as null to show the drawn latte.
 * To use the photo: save it as client/public/images/hero.webp (about 1600 x 1600, under 200 KB)
 * and set src to '/images/hero.webp'. Set width/height to the file's real size.
 */
export const HERO_PHOTO: { src: string; width: number; height: number; alt: string } | null = null;

// Booking rules, mirrored from server/src/lib/cafe.ts so the form can guide people before they submit.
export const BOOKING = {
  maxPartySize: 8,
  windowDays: 30,
  closedWeekdays: [1] as number[], // Monday
  tzOffsetMinutes: 330, // Asia/Kolkata
};

/** Today's date (YYYY-MM-DD) in café time, whatever the visitor's timezone. */
export function cafeToday(now: Date = new Date()): string {
  return new Date(now.getTime() + BOOKING.tzOffsetMinutes * 60_000).toISOString().slice(0, 10);
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function isClosedDay(date: string): boolean {
  return BOOKING.closedWeekdays.includes(new Date(`${date}T00:00:00Z`).getUTCDay());
}

/** "Wednesday 25 November" */
export function formatDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  });
}

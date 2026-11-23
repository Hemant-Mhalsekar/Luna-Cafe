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

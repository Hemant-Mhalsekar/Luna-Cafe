// Sample events until the events API arrives (phase 6).
export interface CafeEvent {
  slug: string;
  title: string;
  type: 'game-night' | 'tournament';
  date: string; // YYYY-MM-DD
  startTime: string;
  description: string;
  capacity: number;
}

export const SAMPLE_EVENTS: CafeEvent[] = [
  {
    slug: 'new-moon-game-night-dec',
    title: 'New Moon Game Night',
    type: 'game-night',
    date: '2026-12-09',
    startTime: '19:00',
    description: 'Come alone or bring friends. We mix tables, teach the rules and keep the chai coming. Perfect if you are new to board games.',
    capacity: 30,
  },
  {
    slug: 'codenames-cup-dec',
    title: 'The Codenames Cup',
    type: 'tournament',
    date: '2026-12-19',
    startTime: '17:30',
    description: 'Teams of four, three rounds, one very small trophy. Sign up as a team or on your own and we will match you.',
    capacity: 32,
  },
  {
    slug: 'cosy-strategy-sunday',
    title: 'Cosy Strategy Sunday',
    type: 'game-night',
    date: '2026-12-27',
    startTime: '14:30',
    description: 'A slow afternoon for longer games like Wingspan and Catan. Our game guru helps you set up and learn.',
    capacity: 20,
  },
  {
    slug: 'full-moon-party-night-jan',
    title: 'Full Moon Party Night',
    type: 'game-night',
    date: '2027-01-03',
    startTime: '19:00',
    description: 'Loud, silly, fast games: Moonlight Mischief, Dixit, Exploding Kittens. Laughter is basically guaranteed.',
    capacity: 40,
  },
];

import { describe, expect, it } from 'vitest';
import { pickGames, timeBucket } from './quiz';
import type { Game } from './types';

let id = 0;
const game = (over: Partial<Game>): Game => ({
  _id: String(++id),
  name: 'Game',
  slug: 'game',
  type: 'party',
  minPlayers: 2,
  maxPlayers: 4,
  playTimeMinutes: 30,
  difficulty: 1,
  moods: [],
  description: '',
  rulesSummary: '',
  accent: 'blue',
  isInvented: false,
  ...over,
});

const shelf = [
  game({ name: 'Quick Silly', playTimeMinutes: 15, moods: ['silly'], maxPlayers: 8 }),
  game({ name: 'Long Brainy', playTimeMinutes: 90, moods: ['brainy'], difficulty: 3 }),
  game({ name: 'Medium Chill Hard', playTimeMinutes: 45, moods: ['chill'], difficulty: 3 }),
  game({ name: 'Medium Chill Easy', playTimeMinutes: 40, moods: ['chill'], difficulty: 1 }),
  game({ name: 'Solo Puzzle', playTimeMinutes: 20, moods: ['brainy'], minPlayers: 1, maxPlayers: 1 }),
];

describe('timeBucket', () => {
  it('splits at 30 and 60 minutes', () => {
    expect([29, 30, 60, 61].map(timeBucket)).toEqual(['quick', 'medium', 'medium', 'long']);
  });
});

describe('pickGames', () => {
  it('only suggests games that seat the group', () => {
    const picks = pickGames(shelf, { players: 6, time: 'quick', mood: 'silly' });
    expect(picks.map((g) => g.name)).toEqual(['Quick Silly']);
  });

  it('ranks mood and time matches first, easier games first when chill', () => {
    const picks = pickGames(shelf, { players: 2, time: 'medium', mood: 'chill' });
    expect(picks.map((g) => g.name)).toEqual(['Medium Chill Easy', 'Medium Chill Hard', 'Quick Silly']);
  });

  it('falls back to the closest fit when nothing seats the group', () => {
    const picks = pickGames(shelf, { players: 12, time: 'quick', mood: 'silly' });
    expect(picks.map((g) => g.name)).toEqual(['Quick Silly']);
  });

  it('suggests solo games for one player', () => {
    expect(pickGames(shelf, { players: 1, time: 'quick', mood: 'brainy' })[0]?.name).toBe('Solo Puzzle');
  });
});

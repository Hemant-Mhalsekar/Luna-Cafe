import type { Game, GameMood } from './types';

export type TimeChoice = 'quick' | 'medium' | 'long';

export interface QuizAnswers {
  players: number;
  time: TimeChoice;
  mood: GameMood;
}

export const PLAYER_CHOICES = [
  { value: 1, label: 'Just me' },
  { value: 2, label: 'Two of us' },
  { value: 4, label: '3 or 4' },
  { value: 6, label: '5 or more' },
] as const;

export const TIME_CHOICES: { value: TimeChoice; label: string; hint: string }[] = [
  { value: 'quick', label: 'A quick one', hint: 'Under 30 minutes' },
  { value: 'medium', label: 'About an hour', hint: '30–60 minutes' },
  { value: 'long', label: 'All evening', hint: 'Over an hour' },
];

export const MOOD_CHOICES: { value: GameMood; label: string; hint: string }[] = [
  { value: 'chill', label: 'Chill', hint: 'Relaxed, chatty, low stakes' },
  { value: 'competitive', label: 'Competitive', hint: 'Someone is going to win' },
  { value: 'silly', label: 'Silly', hint: 'Loud and laughing' },
  { value: 'brainy', label: 'Brainy', hint: 'Plans, puzzles, big thinks' },
];

const ORDER: TimeChoice[] = ['quick', 'medium', 'long'];

export function timeBucket(minutes: number): TimeChoice {
  if (minutes < 30) return 'quick';
  if (minutes <= 60) return 'medium';
  return 'long';
}

/**
 * Scores every game that seats the group and returns the best `limit`.
 * Mood and time each give 3 points for an exact match; a neighbouring time gives 1.
 * For a chill mood, easier games win ties. If nothing seats the group, the closest fits are used.
 */
export function pickGames(games: Game[], answers: QuizAnswers, limit = 3): Game[] {
  const seats = (g: Game) => g.minPlayers <= answers.players && g.maxPlayers >= answers.players;
  let pool = games.filter(seats);
  if (pool.length === 0) {
    const gap = (g: Game) => Math.max(g.minPlayers - answers.players, answers.players - g.maxPlayers, 0);
    const best = Math.min(...games.map(gap));
    pool = games.filter((g) => gap(g) === best);
  }

  const wanted = ORDER.indexOf(answers.time);
  const score = (g: Game) => {
    const distance = Math.abs(ORDER.indexOf(timeBucket(g.playTimeMinutes)) - wanted);
    const time = distance === 0 ? 3 : distance === 1 ? 1 : 0;
    const mood = g.moods.includes(answers.mood) ? 3 : 0;
    return time + mood;
  };

  return [...pool]
    .sort(
      (a, b) =>
        score(b) - score(a) ||
        (answers.mood === 'chill' ? a.difficulty - b.difficulty : 0) ||
        a.name.localeCompare(b.name),
    )
    .slice(0, limit);
}

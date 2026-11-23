import * as m from 'motion/react-m';
import { cn } from '../lib/cn';
import { ClockIcon, DieIcon, MeepleIcon } from './illustrations/GameIcons';

import type { Accent } from '../lib/types';

export interface GameCardData {
  name: string;
  type: string;
  minPlayers: number;
  maxPlayers: number;
  playTimeMinutes: number;
  accent: Accent;
  isInvented?: boolean;
}

const accents: Record<Accent, { bg: string; ink: string; chip: string }> = {
  blue: { bg: 'bg-game-blue-soft', ink: 'text-game-blue', chip: 'bg-game-blue text-white' },
  terracotta: { bg: 'bg-game-terracotta-soft', ink: 'text-game-terracotta', chip: 'bg-game-terracotta text-white' },
  mustard: { bg: 'bg-game-mustard-soft', ink: 'text-game-mustard', chip: 'bg-game-mustard text-white' },
  lavender: { bg: 'bg-game-lavender-soft', ink: 'text-game-lavender', chip: 'bg-game-lavender text-white' },
};

/** Coded game card: accent background, type icon and name. No box art. */
export function GameCard({ game, className }: { game: GameCardData; className?: string }) {
  const a = accents[game.accent];
  const players = game.minPlayers === game.maxPlayers ? `${game.minPlayers}` : `${game.minPlayers}–${game.maxPlayers}`;
  return (
    <m.article
      whileHover={{ y: -6, rotate: -1.2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn('relative flex h-full flex-col overflow-hidden rounded-card border border-outline/40 p-5', a.bg, className)}
    >
      <div className="flex items-center justify-between">
        <span className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold capitalize', a.chip)}>
          <DieIcon className="size-4" />
          {game.type}
        </span>
        {game.isInvented && <span className={cn('text-xs font-semibold', a.ink)}>Luna original</span>}
      </div>
      <h3 className={cn('mt-8 text-2xl leading-tight', a.ink)}>{game.name}</h3>
      <dl className={cn('mt-auto flex gap-4 pt-6 text-sm font-medium', a.ink)}>
        <div className="flex items-center gap-1.5">
          <dt className="sr-only">Players</dt>
          <MeepleIcon className="size-4" />
          <dd>{players} players</dd>
        </div>
        <div className="flex items-center gap-1.5">
          <dt className="sr-only">Play time</dt>
          <ClockIcon className="size-4" />
          <dd>{game.playTimeMinutes} min</dd>
        </div>
      </dl>
    </m.article>
  );
}

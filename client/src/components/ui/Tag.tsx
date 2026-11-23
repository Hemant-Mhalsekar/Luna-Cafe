import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type TagTone = 'forest' | 'blue' | 'terracotta' | 'mustard' | 'lavender';

const tones: Record<TagTone, string> = {
  forest: 'bg-sage-soft text-forest-dark',
  blue: 'bg-game-blue-soft text-game-blue',
  terracotta: 'bg-game-terracotta-soft text-game-terracotta',
  mustard: 'bg-game-mustard-soft text-game-mustard',
  lavender: 'bg-game-lavender-soft text-game-lavender',
};

export function Tag({ tone = 'forest', children, className }: { tone?: TagTone; children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold tracking-wide', tones[tone], className)}>
      {children}
    </span>
  );
}

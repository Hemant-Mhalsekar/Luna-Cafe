import type { CSSProperties, ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type EnterVariant = 'up' | 'left' | 'right' | 'flip' | 'zoom' | 'deal';

/**
 * Entrance for content near the top of a page: pure CSS, so it plays as soon as the pre-rendered
 * HTML paints instead of waiting for JavaScript (keeps the page fast). Further down, use <Reveal>.
 */
export function Enter({ children, variant = 'up', delay = 0, className }: { children: ReactNode; variant?: EnterVariant; delay?: number; className?: string }) {
  return (
    <div className={cn(`enter enter-${variant}`, className)} style={{ animationDelay: `${delay}s` } as CSSProperties}>
      {children}
    </div>
  );
}

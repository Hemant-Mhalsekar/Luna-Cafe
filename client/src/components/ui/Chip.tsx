import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

/** Toggle pill for filters. Uses aria-pressed so screen readers announce the state. */
export function Chip({ pressed, className, ...rest }: { pressed: boolean } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={cn(
        'rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
        pressed
          ? 'border-forest-dark bg-forest-dark text-cream'
          : 'border-outline-strong/50 bg-card text-forest-dark hover:border-forest-dark',
        className,
      )}
      {...rest}
    />
  );
}

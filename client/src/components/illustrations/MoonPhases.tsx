import { cn } from '../../lib/cn';

/**
 * A row of moon phases from new to full. `lit` controls how many are filled in
 * (used later by the loyalty card; here all are shown).
 */
export function MoonPhases({ count = 5, lit = count, className }: { count?: number; lit?: number; className?: string }) {
  return (
    <div className={cn('flex items-center gap-3', className)} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => {
        const fraction = count === 1 ? 1 : i / (count - 1); // 0 = new moon, 1 = full
        const on = i < lit;
        // The lit part is a circle shifted left; the dark disc clips it into a crescent → gibbous → full.
        const shift = 24 * (1 - fraction);
        return (
          <svg key={i} viewBox="0 0 24 24" className="size-7">
            <defs>
              <clipPath id={`moon-${i}`}>
                <circle cx="12" cy="12" r="10" />
              </clipPath>
            </defs>
            <circle cx="12" cy="12" r="10" fill="currentColor" opacity={0.25} />
            {on && fraction > 0 && (
              <g clipPath={`url(#moon-${i})`}>
                <circle cx={12 + shift} cy="12" r="10" fill="currentColor" />
              </g>
            )}
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeOpacity={0.5} strokeWidth="1" />
          </svg>
        );
      })}
    </div>
  );
}

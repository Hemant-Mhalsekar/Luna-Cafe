import { cn } from '../../lib/cn';

/** Crescent moon with three small stars. Stars twinkle when the parent has .twinkle-host and is hovered. */
export function MoonMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn('size-9', className)} aria-hidden="true">
      <circle cx="20" cy="20" r="19" fill="currentColor" className="text-forest-dark" />
      <path d="M24.5 9.5a11 11 0 1 0 5 19A12.5 12.5 0 0 1 24.5 9.5Z" fill="#F6EFDF" />
      <g fill="#F6EFDF">
        <path className="star" d="M29 11.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6Z" />
        <circle className="star" cx="31.5" cy="19" r="0.9" />
        <circle className="star" cx="26.5" cy="16.5" r="0.7" />
      </g>
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('twinkle-host inline-flex items-center gap-2.5', className)}>
      <MoonMark />
      <span className="whitespace-nowrap font-display text-2xl font-semibold tracking-tight text-forest-dark">Luna Café</span>
    </span>
  );
}

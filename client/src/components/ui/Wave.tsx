import { cn } from '../../lib/cn';

/**
 * Organic wave divider. Place it at the top of a band and give it the band's colour,
 * so the band appears to flow up into the one above.
 */
export function Wave({ className, flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 1440 80"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={cn('block h-10 w-full sm:h-16', flip && 'rotate-180', className)}
    >
      <path
        fill="currentColor"
        d="M0 48c96-20 192-36 336-28s264 44 408 44 240-40 384-50 216 10 312 26V80H0Z"
      />
    </svg>
  );
}

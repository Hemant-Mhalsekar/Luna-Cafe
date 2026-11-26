import { cn } from '../../lib/cn';

/** An endless, slightly tilted ribbon of words. Decorative (hidden from screen readers). Pauses on hover; CSS only. */
export function Marquee({ items, className, reverse = false }: { items: string[]; className?: string; reverse?: boolean }) {
  const row = () => (
    <ul className={cn('marquee-track flex shrink-0 items-center gap-8 pr-8', reverse && 'marquee-reverse')}>
      {items.map((t, i) => (
        <li key={i} className="flex items-center gap-8 whitespace-nowrap font-display text-2xl font-semibold sm:text-4xl">
          {t}
          <svg viewBox="0 0 24 24" className="size-6 shrink-0 text-cta sm:size-8" aria-hidden="true">
            <path fill="currentColor" d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2Z" />
          </svg>
        </li>
      ))}
    </ul>
  );
  return (
    <div aria-hidden="true" className={cn('marquee group relative flex overflow-hidden py-5', className)}>
      {row()}
      {row()}
    </div>
  );
}

import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Wave } from './Wave';

type Tone = 'cream' | 'sage' | 'forest';

const tones: Record<Tone, { band: string; wave: string }> = {
  cream: { band: 'bg-cream text-forest-dark', wave: 'text-cream' },
  sage: { band: 'bg-sage text-forest-dark', wave: 'text-sage' },
  forest: { band: 'bg-forest-dark text-cream', wave: 'text-forest-dark' },
};

interface SectionProps {
  tone?: Tone;
  wave?: boolean;
  id?: string;
  className?: string;
  labelledBy?: string;
  children: ReactNode;
}

/** A full-width colour band, optionally with a wave on top. Bands alternate cream and sage. */
export function Section({ tone = 'cream', wave = false, id, className, labelledBy, children }: SectionProps) {
  const t = tones[tone];
  return (
    <section id={id} aria-labelledby={labelledBy} className="relative">
      {wave && <Wave className={cn('-mb-px', t.wave)} />}
      <div className={cn(t.band, 'py-16 sm:py-20', className)}>
        <div className="container-page">{children}</div>
      </div>
    </section>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('mb-3 text-sm font-semibold uppercase tracking-[0.14em]', className)}>{children}</p>
  );
}

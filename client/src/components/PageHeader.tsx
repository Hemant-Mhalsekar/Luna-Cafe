import { useRef, type ReactNode } from 'react';
import { Eyebrow } from './ui/Section';
import { SplitText } from './fx/SplitText';
import { FloatingPieces, type Piece } from './fx/FloatingPieces';

// A few pieces drift around the right side of every page title.
const PIECES: Piece[] = [
  { kind: 'die', top: 18, left: 78, size: 54, depth: 1.2, color: '#b4501f', rotate: 14 },
  { kind: 'meeple', top: 58, left: 88, size: 44, depth: 0.8, color: '#456277', rotate: -10 },
  { kind: 'moon', top: 12, left: 92, size: 30, depth: 0.5, color: '#e9b949' },
  { kind: 'bean', top: 66, left: 70, size: 26, depth: 1.5, color: '#8c4e37', rotate: 30 },
  { kind: 'star', top: 40, left: 64, size: 18, depth: 0.6, color: '#665979' },
  { kind: 'card', top: 30, left: 86, size: 40, depth: 1, color: '#7d5800', rotate: 12 },
];

export function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div ref={ref} className="relative">
      <FloatingPieces pieces={PIECES} target={ref} className="max-sm:hidden max-md:opacity-40" />
      <div className="container-page relative pb-8 pt-14 sm:pt-20">
        <Eyebrow className="page-eyebrow text-forest">{eyebrow}</Eyebrow>
        <h1 className="max-w-3xl text-4xl sm:text-5xl">
          <SplitText text={title} delay={120} step={22} />
        </h1>
        {children && <div className="page-intro mt-4 max-w-2xl text-lg text-forest">{children}</div>}
      </div>
    </div>
  );
}

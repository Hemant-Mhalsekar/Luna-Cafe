import { useEffect, type RefObject } from 'react';
import * as m from 'motion/react-m';
import { useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from 'motion/react';
import { cn } from '../../lib/cn';

type Kind = 'die' | 'meeple' | 'moon' | 'bean' | 'star' | 'card';

export interface Piece {
  kind: Kind;
  /** Position in % of the container. */
  top: number;
  left: number;
  size: number;
  /** Parallax depth: higher moves more with scroll and mouse. */
  depth: number;
  color: string;
  rotate?: number;
}

function Shape({ kind }: { kind: Kind }) {
  switch (kind) {
    case 'die':
      return (
        <svg viewBox="0 0 40 40" className="size-full drop-shadow-md">
          <rect x="3" y="3" width="34" height="34" rx="9" fill="currentColor" />
          <g fill="#fffdf8">
            <circle cx="12" cy="12" r="3" />
            <circle cx="28" cy="12" r="3" />
            <circle cx="20" cy="20" r="3" />
            <circle cx="12" cy="28" r="3" />
            <circle cx="28" cy="28" r="3" />
          </g>
        </svg>
      );
    case 'meeple':
      return (
        <svg viewBox="0 0 24 24" className="size-full drop-shadow-md" fill="currentColor">
          <path d="M12 2.5a3.5 3.5 0 0 0-3.4 4.3C5.6 7.6 3 9 3 10.8c0 1.1 1.4 1.8 3.4 2.1L4.3 19.6c-.2.9.4 1.9 1.4 1.9h3.4l2.2-4.2c.3-.6 1.1-.6 1.4 0l2.2 4.2h3.4c1 0 1.6-1 1.4-1.9l-2.1-6.7c2-.3 3.4-1 3.4-2.1 0-1.8-2.6-3.2-5.6-4A3.5 3.5 0 0 0 12 2.5Z" />
        </svg>
      );
    case 'moon':
      return (
        <svg viewBox="0 0 24 24" className="size-full" fill="currentColor">
          <path d="M15 3a9 9 0 1 0 6 15.7A10.5 10.5 0 0 1 15 3Z" />
        </svg>
      );
    case 'bean':
      return (
        <svg viewBox="0 0 24 24" className="size-full">
          <ellipse cx="12" cy="12" rx="7" ry="10" fill="currentColor" />
          <path d="M12 3c-3 4 3 14 0 18" stroke="#fffdf8" strokeOpacity=".5" strokeWidth="1.5" fill="none" />
        </svg>
      );
    case 'star':
      return (
        <svg viewBox="0 0 24 24" className="size-full" fill="currentColor">
          <path d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2Z" />
        </svg>
      );
    case 'card':
      return (
        <svg viewBox="0 0 30 40" className="size-full drop-shadow-md">
          <rect x="1" y="1" width="28" height="38" rx="4" fill="#fffdf8" stroke="currentColor" strokeWidth="2" />
          <path d="M15 12c-3-4-8 0-4 4l4 4 4-4c4-4-1-8-4-4Z" fill="currentColor" />
        </svg>
      );
  }
}

function FloatingPiece({ p, i, scroll, mx, my }: { p: Piece; i: number; scroll: MotionValue<number>; mx: MotionValue<number>; my: MotionValue<number> }) {
  const sy = useTransform(scroll, [0, 1], [0, -260 * p.depth]);
  const sr = useTransform(scroll, [0, 1], [p.rotate ?? 0, (p.rotate ?? 0) + 180 * p.depth * (i % 2 ? 1 : -1)]);
  const px = useTransform(mx, (v) => v * 40 * p.depth);
  const py = useTransform(my, (v) => v * 40 * p.depth);
  return (
    <m.span className="absolute" style={{ top: `${p.top}%`, left: `${p.left}%`, width: p.size, height: p.size, y: sy, rotate: sr, color: p.color }}>
      <m.span className="block size-full" style={{ x: px, y: py }}>
        <span className="float-bob block size-full" style={{ animationDelay: `${-i * 0.9}s`, animationDuration: `${5 + (i % 4)}s` }}>
          <Shape kind={p.kind} />
        </span>
      </m.span>
    </m.span>
  );
}

/**
 * Game pieces, beans and moons drifting behind a section. They bob on their own, drift with scroll
 * (each at its own depth) and lean away from the mouse. Purely decorative.
 */
export function FloatingPieces({ pieces, target, className }: { pieces: Piece[]; target: RefObject<HTMLElement | null>; className?: string }) {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target, offset: ['start start', 'end start'] });
  const mx = useSpring(useMotionValue(0), { stiffness: 60, damping: 20 });
  const my = useSpring(useMotionValue(0), { stiffness: 60, damping: 20 });

  useEffect(() => {
    if (reduce) return;
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      mx.set(e.clientX / window.innerWidth - 0.5);
      my.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, [reduce, mx, my]);

  return (
    <div aria-hidden="true" className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      {pieces.map((p, i) => (
        <FloatingPiece key={i} p={p} i={i} scroll={scrollYProgress} mx={mx} my={my} />
      ))}
    </div>
  );
}

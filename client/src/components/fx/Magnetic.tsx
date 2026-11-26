import { useRef, type PointerEvent, type ReactNode } from 'react';
import * as m from 'motion/react-m';
import { useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import { cn } from '../../lib/cn';

/** Pulls its child toward the mouse while hovered, then springs back. */
export function Magnetic({ children, strength = 0.35, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 250, damping: 15, mass: 0.5 });
  const y = useSpring(useMotionValue(0), { stiffness: 250, damping: 15, mass: 0.5 });
  const move = (e: PointerEvent) => {
    if (reduce || e.pointerType !== 'mouse' || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const leave = () => {
    x.set(0);
    y.set(0);
  };
  return (
    <m.span ref={ref} onPointerMove={move} onPointerLeave={leave} style={{ x, y }} className={cn('inline-block', className)}>
      {children}
    </m.span>
  );
}

import { useRef, type PointerEvent, type ReactNode } from 'react';
import * as m from 'motion/react-m';
import { useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react';
import { cn } from '../../lib/cn';

/**
 * 3D tilt toward the mouse with a soft glare that follows the pointer.
 * Mouse only (touch scrolls normally) and off when the OS asks for reduced motion.
 */
export function Tilt({ children, className, max = 10, glare = true }: { children: ReactNode; className?: string; max?: number; glare?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const spring = { stiffness: 220, damping: 18 };
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), spring);
  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), spring);
  const gx = useTransform(px, (v) => `${v * 100}%`);
  const gy = useTransform(py, (v) => `${v * 100}%`);
  const glareBg = useMotionTemplate`radial-gradient(circle at ${gx} ${gy}, rgb(255 255 255 / 0.35), transparent 55%)`;
  const glareOpacity = useSpring(0, spring);

  const move = (e: PointerEvent) => {
    if (reduce || e.pointerType !== 'mouse' || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
    glareOpacity.set(1);
  };
  const leave = () => {
    px.set(0.5);
    py.set(0.5);
    glareOpacity.set(0);
  };

  return (
    <m.div
      ref={ref}
      onPointerMove={move}
      onPointerLeave={leave}
      style={{ rotateX, rotateY, transformPerspective: 900, transformStyle: 'preserve-3d' }}
      className={cn('relative', className)}
    >
      {children}
      {glare && !reduce && (
        <m.span aria-hidden="true" style={{ background: glareBg, opacity: glareOpacity }} className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] mix-blend-soft-light" />
      )}
    </m.div>
  );
}

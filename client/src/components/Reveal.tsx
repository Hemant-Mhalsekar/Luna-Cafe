import * as m from 'motion/react-m';
import type { ReactNode } from 'react';

export type RevealVariant = 'up' | 'left' | 'right' | 'zoom' | 'blur' | 'flip' | 'tilt';

const from: Record<RevealVariant, Record<string, number | string>> = {
  up: { opacity: 0, y: 48, scale: 0.97, filter: 'blur(6px)' },
  left: { opacity: 0, x: -80, rotate: -2, filter: 'blur(6px)' },
  right: { opacity: 0, x: 80, rotate: 2, filter: 'blur(6px)' },
  zoom: { opacity: 0, scale: 0.8, filter: 'blur(10px)' },
  blur: { opacity: 0, filter: 'blur(16px)', y: 16 },
  flip: { opacity: 0, rotateX: -70, y: 40, transformPerspective: 900 },
  tilt: { opacity: 0, y: 70, rotate: -6, scale: 0.92 },
};
const to = { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0, rotateX: 0, filter: 'blur(0px)' };

/**
 * Brings its children in when they scroll into view, with a choice of entrances.
 * Reduced motion is handled by MotionConfig in Layout (transforms are skipped, the fade stays).
 */
export function Reveal({
  children,
  delay = 0,
  className,
  variant = 'up',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  variant?: RevealVariant;
}) {
  return (
    <m.div
      className={className}
      initial={from[variant]}
      whileInView={to}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ type: 'spring', stiffness: 90, damping: 18, mass: 0.9, delay, filter: { duration: 0.5, delay }, opacity: { duration: 0.5, delay } }}
    >
      {children}
    </m.div>
  );
}

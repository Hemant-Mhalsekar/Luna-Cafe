import { motion } from 'motion/react';
import type { ReactNode } from 'react';

/** Fades and lifts its children in when they scroll into view. Reduced motion is handled by MotionConfig. */
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.2, 0, 0, 1] }}
    >
      {children}
    </motion.div>
  );
}

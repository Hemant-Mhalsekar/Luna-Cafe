import { useRef, type ReactNode } from 'react';
import * as m from 'motion/react-m';
import { useScroll, useTransform } from 'motion/react';
import { cn } from '../../lib/cn';

/** Moves its content slower or faster than the page while it scrolls past (photos float). */
export function Parallax({ children, speed = 0.15, className, zoom = false }: { children: ReactNode; speed?: number; className?: string; zoom?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [`${speed * 100}%`, `${-speed * 100}%`]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], zoom ? [1.25, 1.08, 1.25] : [1, 1, 1]);
  return (
    <div ref={ref} className={cn('overflow-hidden', className)}>
      <m.div style={{ y, scale }} className="size-full">
        {children}
      </m.div>
    </div>
  );
}

import * as m from 'motion/react-m';
import { useScroll, useSpring, useTransform } from 'motion/react';

/** A thin bar under the header that fills as you scroll, with a tiny moon riding the tip. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 24, restDelta: 0.001 });
  const left = useTransform(scaleX, (v) => `${v * 100}%`);
  const rotate = useTransform(scaleX, [0, 1], [0, 720]);
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -bottom-[3px] h-[3px]">
      <m.div style={{ scaleX }} className="h-full origin-left bg-gradient-to-r from-sage via-cta to-game-mustard" />
      <m.span style={{ left, rotate }} className="absolute top-1/2 -ml-2 -mt-2 block size-4">
        <svg viewBox="0 0 24 24" className="size-4 text-cta">
          <path fill="currentColor" d="M15 3a9 9 0 1 0 6 15.7A10.5 10.5 0 0 1 15 3Z" />
        </svg>
      </m.span>
    </div>
  );
}

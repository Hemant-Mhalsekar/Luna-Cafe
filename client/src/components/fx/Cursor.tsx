import { useEffect, useState } from 'react';
import * as m from 'motion/react-m';
import { useMotionValue, useReducedMotion, useSpring } from 'motion/react';

/**
 * A moon-ring that trails the mouse and swells over anything clickable. Decoration only:
 * the normal cursor stays, and it never shows on touch screens or with reduced motion.
 * Elements can set data-cursor="Play" (etc.) to show a word inside the ring.
 */
export function Cursor() {
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const [down, setDown] = useState(false);
  const [visible, setVisible] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 350, damping: 28, mass: 0.6 });
  const ry = useSpring(y, { stiffness: 350, damping: 28, mass: 0.6 });

  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine) and (hover: hover)');
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!enabled || reduce) return;
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
      const el = (e.target as Element | null)?.closest?.('a, button, [role="button"], input, select, textarea, label, summary, [data-cursor]');
      setHover(el ? ((el as HTMLElement).dataset.cursor ?? '') : null);
    };
    const leave = () => setVisible(false);
    const press = () => setDown(true);
    const release = () => setDown(false);
    window.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', leave);
    window.addEventListener('pointerdown', press);
    window.addEventListener('pointerup', release);
    return () => {
      window.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', leave);
      window.removeEventListener('pointerdown', press);
      window.removeEventListener('pointerup', release);
    };
  }, [enabled, reduce, x, y]);

  if (!enabled || reduce) return null;
  const label = hover && hover.length > 0 ? hover : null;
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[100]" style={{ opacity: visible ? 1 : 0, transition: 'opacity .2s' }}>
      <m.div style={{ x: rx, y: ry }} className="absolute left-0 top-0">
        <m.div
          animate={{ scale: down ? 0.7 : label ? 2.6 : hover !== null ? 1.7 : 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          className={`-ml-5 -mt-5 grid size-10 place-items-center rounded-full border-2 ${label ? 'border-cta bg-cta' : 'border-forest-dark/70'} mix-blend-multiply`}
        >
          {label && <span className="text-[6px] font-bold uppercase tracking-widest text-white">{label}</span>}
        </m.div>
      </m.div>
      <m.div style={{ x, y }} className="absolute left-0 top-0 -ml-1 -mt-1 size-2 rounded-full bg-cta" />
    </div>
  );
}

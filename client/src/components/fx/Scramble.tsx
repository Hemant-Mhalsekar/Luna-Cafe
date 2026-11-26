import { useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';

const GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * Rolls each character like a slot machine before it settles on the real text (left to right).
 * The real text is always in the page (screen readers, copy-paste, tests); the rolling letters are
 * drawn on top with CSS generated content, so they never end up in the text itself.
 */
export function Scramble({ text, duration = 1400, className }: { text: string; duration?: number; className?: string }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState<string | null>(reduce ? null : text.replace(/[A-Z0-9]/g, '·'));
  useEffect(() => {
    if (reduce) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const settled = Math.floor(t * text.length);
      if (t >= 1) {
        setShown(null);
        return;
      }
      setShown(
        [...text]
          .map((ch, i) => (i < settled || !/[A-Z0-9]/.test(ch) ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
          .join(''),
      );
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, duration, reduce]);
  return (
    <span className={`relative inline-block ${className ?? ''}`}>
      <span style={shown ? { color: 'transparent' } : undefined}>{text}</span>
      {shown && <span aria-hidden="true" data-text={shown} className="scramble-overlay absolute inset-0" />}
    </span>
  );
}

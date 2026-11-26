import type { CSSProperties } from 'react';
import { cn } from '../../lib/cn';

/**
 * Letters rise out of a mask one after another. Pure CSS (no JavaScript needed to see the text),
 * so headings still paint at once. Screen readers get the plain text through aria-label.
 */
export function SplitText({ text, className, delay = 0, step = 28 }: { text: string; className?: string; delay?: number; step?: number }) {
  let i = 0;
  return (
    <span className={cn('split', className)}>
      <span className="sr-only">{text}</span>
      {text.split(' ').map((word, w) => (
        <span key={w} aria-hidden="true" className="split-word">
          {[...word].map((ch, c) => (
            <span key={c} className="split-char" style={{ '--d': `${delay + i++ * step}ms` } as CSSProperties}>
              {ch}
            </span>
          ))}
          {w < text.split(' ').length - 1 && ' '}
        </span>
      ))}
    </span>
  );
}

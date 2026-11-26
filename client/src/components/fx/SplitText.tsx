import { Fragment, type CSSProperties } from 'react';
import { cn } from '../../lib/cn';

/**
 * Letters rise out of a mask one after another. Pure CSS (no JavaScript needed to see the text),
 * so headings still paint at once. The text stays plain text in the page (one copy), so search
 * engines and screen readers read the heading normally.
 */
export function SplitText({ text, className, delay = 0, step = 28 }: { text: string; className?: string; delay?: number; step?: number }) {
  let i = 0;
  const words = text.split(' ');
  return (
    <span className={cn('split', className)}>
      {words.map((word, w) => (
        <Fragment key={w}>
          <span className="split-word">
            {[...word].map((ch, c) => (
              <span key={c} className="split-char" style={{ '--d': `${delay + i++ * step}ms` } as CSSProperties}>
                {ch}
              </span>
            ))}
          </span>
          {w < words.length - 1 && ' '}
        </Fragment>
      ))}
    </span>
  );
}

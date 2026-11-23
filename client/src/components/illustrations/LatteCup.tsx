import { cn } from '../../lib/cn';

/**
 * Coded hero illustration: a latte seen from above with a leaf in the foam.
 * Stands in until the photo is ready, and stays as the fallback.
 */
export function LatteCup({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 400" className={cn('h-full w-full', className)} role="img" aria-label="A latte with leaf art, seen from above">
      <ellipse cx="200" cy="214" rx="170" ry="160" fill="#8a9c81" opacity="0.35" />
      {/* saucer */}
      <circle cx="200" cy="200" r="168" fill="#FFFDF8" />
      <circle cx="200" cy="200" r="150" fill="#F3EBDB" />
      {/* handle */}
      <rect x="318" y="176" width="64" height="48" rx="24" fill="#FFFDF8" stroke="#E2D8C3" strokeWidth="4" />
      {/* cup */}
      <circle cx="200" cy="200" r="124" fill="#FFFDF8" stroke="#E2D8C3" strokeWidth="4" />
      <circle cx="200" cy="200" r="104" fill="#9A6238" />
      <circle cx="200" cy="200" r="104" fill="url(#crema)" />
      {/* latte art leaf */}
      <g fill="#F6EBD9" className="latte-leaf">
        <path d="M200 120c26 22 40 48 40 78s-14 56-40 78c-26-22-40-48-40-78s14-56 40-78Z" opacity="0.95" />
        <path d="M200 132v140" stroke="#9A6238" strokeWidth="5" strokeLinecap="round" fill="none" />
        {[150, 170, 190, 210, 230, 250].map((y, i) => (
          <g key={y} stroke="#9A6238" strokeWidth="4" strokeLinecap="round" fill="none">
            <path d={`M200 ${y}c-${12 + i * 2} -6 -${20 + i * 2} -14 -${24 - i} -24`} />
            <path d={`M200 ${y}c${12 + i * 2} -6 ${20 + i * 2} -14 ${24 - i} -24`} />
          </g>
        ))}
        <circle cx="200" cy="284" r="9" />
      </g>
      <defs>
        <radialGradient id="crema" cx="0.45" cy="0.4" r="0.7">
          <stop offset="0" stopColor="#C58A57" stopOpacity="0.9" />
          <stop offset="1" stopColor="#7A4A28" stopOpacity="0.2" />
        </radialGradient>
      </defs>
    </svg>
  );
}

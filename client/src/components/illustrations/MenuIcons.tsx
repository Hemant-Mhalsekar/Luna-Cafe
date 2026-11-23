import type { MenuCategory } from '../../lib/types';
import { CupIcon } from './GameIcons';

const common = { viewBox: '0 0 48 48', fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

function TeaIcon({ className }: { className?: string }) {
  return (
    <svg {...common} className={className} aria-hidden="true">
      <path d="M10 20h24v6a12 12 0 0 1-24 0v-6Z" />
      <path d="M34 22h3a4 4 0 0 1 0 8h-3.5" />
      <path d="M22 20v-9m0 0-3 3m3-3h5" />
      <rect x="26" y="9" width="5" height="6" rx="1" />
    </svg>
  );
}

function ColdIcon({ className }: { className?: string }) {
  return (
    <svg {...common} className={className} aria-hidden="true">
      <path d="M13 14h22l-3 26H16L13 14Z" />
      <path d="m28 6-3 12" />
      <rect x="18" y="22" width="6" height="6" rx="1.5" />
      <rect x="25" y="27" width="5" height="5" rx="1.5" />
    </svg>
  );
}

function BakeIcon({ className }: { className?: string }) {
  return (
    <svg {...common} className={className} aria-hidden="true">
      <path d="M6 30c4-10 10-14 18-14s14 4 18 14c-3 3-6 4-9 3-2 3-6 4-9 4s-7-1-9-4c-3 1-6 0-9-3Z" />
      <path d="M17 20l3 13M31 20l-3 13M24 17v19" />
    </svg>
  );
}

function SnackIcon({ className }: { className?: string }) {
  return (
    <svg {...common} className={className} aria-hidden="true">
      <path d="M8 24h32a16 16 0 0 1-32 0Z" />
      <path d="M16 24l2-12M23 24l1-14M30 24l-1-12M36 24l-3-9" />
    </svg>
  );
}

export function MenuIcon({ category, className }: { category: MenuCategory; className?: string }) {
  switch (category) {
    case 'coffee':
      return <CupIcon className={className} />;
    case 'tea':
      return <TeaIcon className={className} />;
    case 'cold-drinks':
      return <ColdIcon className={className} />;
    case 'bakes':
      return <BakeIcon className={className} />;
    default:
      return <SnackIcon className={className} />;
  }
}

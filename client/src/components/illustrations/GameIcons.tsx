import { cn } from '../../lib/cn';

export function DieIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn('size-5', className)} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <g fill="currentColor" stroke="none">
        <circle cx="8.5" cy="8.5" r="1.4" />
        <circle cx="12" cy="12" r="1.4" />
        <circle cx="15.5" cy="15.5" r="1.4" />
      </g>
    </svg>
  );
}

export function MeepleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn('size-5', className)} fill="currentColor" aria-hidden="true">
      <path d="M12 2.5a3.5 3.5 0 0 0-3.4 4.3C5.6 7.6 3 9 3 10.8c0 1.1 1.4 1.8 3.4 2.1L4.3 19.6c-.2.9.4 1.9 1.4 1.9h3.4l2.2-4.2c.3-.6 1.1-.6 1.4 0l2.2 4.2h3.4c1 0 1.6-1 1.4-1.9l-2.1-6.7c2-.3 3.4-1 3.4-2.1 0-1.8-2.6-3.2-5.6-4A3.5 3.5 0 0 0 12 2.5Z" />
    </svg>
  );
}

export function CupIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn('size-5', className)} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9Z" />
      <path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16" />
      <path d="M8 3.5c0 1 1 1.5 1 2.5M12 3.5c0 1 1 1.5 1 2.5" />
    </svg>
  );
}

export function ClockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn('size-5', className)} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

export function PinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn('size-5', className)} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11Z" />
      <circle cx="12" cy="10" r="2.3" />
    </svg>
  );
}

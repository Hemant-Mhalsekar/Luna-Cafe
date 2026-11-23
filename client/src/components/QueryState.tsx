import type { ReactNode } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

/** Friendly error card with a retry button, for when the API cannot be reached. */
export function LoadError({ what, onRetry }: { what: string; onRetry: () => void }) {
  return (
    <Card className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between" role="alert">
      <p className="text-forest-dark">
        We couldn't load the {what} just now. The café's server might still be waking up.
      </p>
      <Button variant="secondary" onClick={onRetry}>
        Try again
      </Button>
    </Card>
  );
}

/** Grid of pulsing placeholders while data loads. */
export function SkeletonGrid({ count = 8, className, item }: { count?: number; className?: string; item?: ReactNode }) {
  return (
    <div className={className} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="motion-safe:animate-pulse">
          {item ?? <div className="h-48 rounded-card bg-cream-deep" />}
        </div>
      ))}
    </div>
  );
}

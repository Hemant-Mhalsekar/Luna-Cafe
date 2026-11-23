import { useServerStatus } from '../../lib/useServerStatus';
import { MoonMark } from '../illustrations/Logo';

/**
 * Explains the cold start of the free API server. Only appears when the first health check is slow
 * (or fails), and disappears on its own once the server answers.
 */
export function ServerWakeBanner() {
  const status = useServerStatus();
  if (status === 'ok') return null;

  const waking = status === 'waking';
  return (
    <div role="status" aria-live="polite" className="border-b border-outline/50 bg-sage-soft">
      <div className="container-page flex items-center gap-3 py-3 text-sm text-forest-dark">
        <span className="twinkle-host shrink-0">
          <MoonMark className={waking ? 'size-7 motion-safe:animate-pulse' : 'size-7'} />
        </span>
        {waking ? (
          <p>
            <strong className="font-semibold">Waking up the café…</strong> Our free server naps when it's quiet, so
            bookings and the game library may take up to a minute the first time.
          </p>
        ) : (
          <p>
            <strong className="font-semibold">We can't reach the café's kitchen right now.</strong> You can still look
            around; bookings and live data will work again shortly.
          </p>
        )}
      </div>
    </div>
  );
}

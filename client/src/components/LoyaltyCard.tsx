import { useState, useSyncExternalStore } from 'react';
import * as m from 'motion/react-m';
import { AnimatePresence } from 'motion/react';
import { Button } from './ui/Button';
import { moonPath } from '../lib/moon';
import { Tilt } from './fx/Tilt';
import { cn } from '../lib/cn';

const STAMPS = 8;
const STORAGE_KEY = 'luna-moon-card';
const PHASE_NAMES = ['New moon', 'Waxing crescent', 'First quarter', 'Waxing gibbous', 'Full moon', 'Waning gibbous', 'Last quarter', 'Waning crescent'];

function readStamps(): number {
  try {
    const n = Number(window.localStorage.getItem(STORAGE_KEY));
    return Number.isInteger(n) && n >= 0 && n <= STAMPS ? n : 0;
  } catch {
    return 0;
  }
}

function saveStamps(n: number) {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(n));
  } catch {
    // Private mode or storage blocked: the card still works for this visit.
  }
}

// A tiny store over localStorage (kept in memory too, so the card still works when storage is blocked).
let current: number | null = null;
const listeners = new Set<() => void>();
function currentStamps() {
  if (current === null) current = readStamps();
  return current;
}
function setCurrent(n: number) {
  current = n;
  saveStamps(n);
  listeners.forEach((l) => l());
}
function subscribe(listener: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return;
    current = readStamps();
    listener();
  };
  listeners.add(listener);
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

/**
 * The Moon Club card: each drink fills in the next phase of the moon; a full cycle earns a free drink.
 * UI only (no accounts): stamps live in this browser's localStorage.
 */
export function LoyaltyCard() {
  // The pre-rendered page shows an empty card; the browser then shows this device's saved stamps.
  const stamps = useSyncExternalStore(subscribe, currentStamps, () => 0);
  const [flipped, setFlipped] = useState(false);
  const complete = stamps >= STAMPS;

  const update = (n: number) => {
    setCurrent(n);
    if (n === STAMPS) void import('../lib/confetti').then((c) => c.celebrate());
  };

  return (
    <Tilt className="rounded-[2rem]" max={14}>
    <div className="flip-scene">
    <div className={cn('flip-inner', flipped && 'is-flipped')}>
    <div
      className={cn('twinkle-host relative overflow-hidden rounded-[2rem] bg-forest-dark p-6 text-cream shadow-lift transition-shadow duration-700 sm:p-8', complete && 'moon-glow')}
      aria-hidden={flipped || undefined}
      inert={flipped || undefined}
    >
      {/* Holographic sheen that drifts across the card. */}
      <span aria-hidden="true" className="card-sheen pointer-events-none absolute inset-0" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-cream/75">Lunaa Café</p>
          <p className="mt-1 font-display text-3xl font-semibold">Moon Club card</p>
        </div>
        <button
          type="button"
          onClick={() => setFlipped(true)}
          className="flex items-center gap-1.5 rounded-full border border-cream/30 px-3 py-1.5 text-sm font-semibold transition-colors hover:bg-cream hover:text-forest-dark"
        >
          <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
            <path className="star" fill="currentColor" d="M12 3l1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6Z" />
          </svg>
          How it works
        </button>
      </div>

      <ol className="mt-6 grid grid-cols-4 gap-3 sm:gap-4" aria-label={`${stamps} of ${STAMPS} stamps`}>
        {PHASE_NAMES.map((name, i) => {
          const on = i < stamps;
          return (
            <li key={name} className="relative flex flex-col items-center gap-1.5">
              {/* A ring bursts out when a stamp lands. */}
              <AnimatePresence>
                {on && (
                  <m.span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-1/2 top-1/2 -ml-8 -mt-8 size-16 rounded-full border-2 border-[#e9b949]"
                    initial={{ scale: 0.5, opacity: 1 }}
                    animate={{ scale: 1.8, opacity: 0 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                  />
                )}
              </AnimatePresence>
              <m.svg
                viewBox="0 0 40 40"
                className="size-14 sm:size-16"
                role="img"
                aria-label={`${name}: ${on ? 'stamped' : 'not yet'}`}
                animate={on ? { rotate: [0, -25, 15, 0], scale: [1, 1.3, 0.95, 1] } : { rotate: 0, scale: 1 }}
                transition={{ duration: 0.6 }}
                whileHover={{ scale: 1.12, rotate: 10 }}
              >
                <circle cx="20" cy="20" r="16" fill="currentColor" className="text-cream/10" />
                <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray={on ? undefined : '3 3'} className="text-cream/45" />
                <AnimatePresence>
                  {on && (
                    <m.path
                      d={i === 0 ? 'M 20 4 A 16 16 0 1 1 19.99 4 Z' : moonPath(i / STAMPS)}
                      fill="currentColor"
                      className={i === 0 ? 'text-cream/35' : 'text-cream'}
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.6, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                      style={{ transformOrigin: '20px 20px' }}
                    />
                  )}
                </AnimatePresence>
              </m.svg>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 min-h-24" aria-live="polite">
        {complete ? (
          <>
            <p className="font-display text-2xl font-semibold">Full cycle! Your next drink is on us.</p>
            <Button variant="secondary-light" className="mt-4" onClick={() => update(0)}>
              Start a new card
            </Button>
          </>
        ) : (
          <>
            <p className="text-cream/85">
              {stamps === 0 ? 'Every drink fills in a phase of the moon.' : `${STAMPS - stamps} more ${STAMPS - stamps === 1 ? 'drink' : 'drinks'} to a free one.`}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button onClick={() => update(stamps + 1)}>Stamp my card</Button>
              {stamps > 0 && (
                <button type="button" onClick={() => update(0)} className="text-sm font-semibold text-cream/80 underline underline-offset-4 hover:text-cream">
                  Reset
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>

    {/* Back of the card. */}
    <div
      className="flip-back flex flex-col rounded-[2rem] bg-cream-deep p-6 text-forest-dark shadow-lift sm:p-8"
      aria-hidden={!flipped || undefined}
      inert={!flipped || undefined}
    >
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-forest">The Moon Club</p>
      <p className="mt-1 font-display text-3xl font-semibold">How it works</p>
      <ol className="mt-5 flex-1 space-y-3 text-lg">
        <li><span className="font-display font-semibold text-cta">1.</span> Order any drink at the bar.</li>
        <li><span className="font-display font-semibold text-cta">2.</span> We stamp the next phase of your moon.</li>
        <li><span className="font-display font-semibold text-cta">3.</span> Eight phases make a full cycle: the next drink is on us.</li>
      </ol>
      <Button variant="secondary" className="mt-6 self-start" onClick={() => setFlipped(false)}>
        Back to my card
      </Button>
    </div>
    </div>
    </div>
    </Tilt>
  );
}

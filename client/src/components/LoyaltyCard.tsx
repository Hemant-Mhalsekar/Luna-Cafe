import { useState } from 'react';
import * as m from 'motion/react-m';
import { AnimatePresence } from 'motion/react';
import { Button } from './ui/Button';
import { moonPath } from '../lib/moon';

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

/**
 * The Moon Club card: each drink fills in the next phase of the moon; a full cycle earns a free drink.
 * UI only (no accounts): stamps live in this browser's localStorage.
 */
export function LoyaltyCard() {
  const [stamps, setStamps] = useState(readStamps);
  const complete = stamps >= STAMPS;

  const update = (n: number) => {
    setStamps(n);
    saveStamps(n);
  };

  return (
    <div className="twinkle-host rounded-[2rem] bg-forest-dark p-6 text-cream shadow-lift sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-cream/75">Luna Café</p>
          <p className="mt-1 font-display text-3xl font-semibold">Moon Club card</p>
        </div>
        <svg viewBox="0 0 24 24" className="size-8 text-cream" aria-hidden="true">
          <path className="star" fill="currentColor" d="M12 3l1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6Z" />
        </svg>
      </div>

      <ol className="mt-6 grid grid-cols-4 gap-3 sm:gap-4" aria-label={`${stamps} of ${STAMPS} stamps`}>
        {PHASE_NAMES.map((name, i) => {
          const on = i < stamps;
          return (
            <li key={name} className="flex flex-col items-center gap-1.5">
              <svg viewBox="0 0 40 40" className="size-14 sm:size-16" role="img" aria-label={`${name}: ${on ? 'stamped' : 'not yet'}`}>
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
              </svg>
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
  );
}

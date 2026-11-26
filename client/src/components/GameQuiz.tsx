import { useRef, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { Button, LinkButton } from './ui/Button';
import { GameCard } from './GameCard';
import { MoonPhases } from './illustrations/MoonPhases';
import { cn } from '../lib/cn';
import { MOOD_CHOICES, PLAYER_CHOICES, TIME_CHOICES, pickGames, type QuizAnswers } from '../lib/quiz';
import type { Game } from '../lib/types';

type Step = 0 | 1 | 2 | 3;

const QUESTIONS = ['How many people are playing?', 'How much time do you have?', "What's the mood?"];

/** Three quick questions, then three suggested games. */
export function GameQuiz({ games, onSelect }: { games: Game[]; onSelect: (g: Game) => void }) {
  const [step, setStep] = useState<Step>(0);
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({});
  const headingRef = useRef<HTMLHeadingElement>(null);

  const go = (next: Step, patch: Partial<QuizAnswers> = {}) => {
    setAnswers((a) => ({ ...a, ...patch }));
    setStep(next);
    // Move focus to the new question so keyboard and screen reader users follow along.
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const done = step === 3 && answers.players && answers.time && answers.mood;
  const picks = done ? pickGames(games, answers as QuizAnswers) : [];

  return (
    <section id="quiz" aria-labelledby="quiz-title" className="scroll-mt-24 rounded-card bg-forest-dark p-6 text-cream sm:p-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 id="quiz-title" className="text-3xl">
          Not sure what to play?
        </h2>
        <MoonPhases count={4} lit={step + 1} className="text-cream" />
      </div>
      <p className="mt-1 text-cream/85">Three questions, three suggestions. Takes ten seconds.</p>

      <div className="mt-8 min-h-56" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
          >
            {step < 3 ? (
              <>
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-cream/75">
                  Question {step + 1} of 3
                </p>
                <h3 ref={headingRef} tabIndex={-1} className="mt-2 text-2xl focus:outline-none">
                  {QUESTIONS[step]}
                </h3>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {step === 0 &&
                    PLAYER_CHOICES.map((c) => (
                      <Choice key={c.value} label={c.label} selected={answers.players === c.value} onClick={() => go(1, { players: c.value })} />
                    ))}
                  {step === 1 &&
                    TIME_CHOICES.map((c) => (
                      <Choice key={c.value} label={c.label} hint={c.hint} selected={answers.time === c.value} onClick={() => go(2, { time: c.value })} />
                    ))}
                  {step === 2 &&
                    MOOD_CHOICES.map((c) => (
                      <Choice key={c.value} label={c.label} hint={c.hint} selected={answers.mood === c.value} onClick={() => go(3, { mood: c.value })} />
                    ))}
                </div>
                {step > 0 && (
                  <button type="button" onClick={() => go((step - 1) as Step)} className="mt-5 text-sm font-semibold underline underline-offset-4">
                    Back
                  </button>
                )}
              </>
            ) : (
              <>
                <h3 ref={headingRef} tabIndex={-1} className="text-2xl focus:outline-none">
                  Your Lunaa table matches
                </h3>
                {picks.length === 0 ? (
                  <p className="mt-3 text-cream/85">The shelf is loading. Try again in a moment.</p>
                ) : (
                  <ul className="mt-5 grid gap-4 md:grid-cols-3">
                    {picks.map((g) => (
                      <li key={g._id}>
                        <button type="button" onClick={() => onSelect(g)} className="block h-full w-full rounded-card text-left text-forest-dark" aria-label={`${g.name}: see details`}>
                          <GameCard game={g} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-6 flex flex-wrap gap-3">
                  {picks[0] && (
                    <LinkButton to={`/book?game=${picks[0].slug}`} size="lg">
                      Book a table for {picks[0].name}
                    </LinkButton>
                  )}
                  <Button variant="secondary-light" size="lg" onClick={() => go(0, {})}>
                    Start again
                  </Button>
                </div>
              </>
            )}
          </m.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

function Choice({ label, hint, selected, onClick }: { label: string; hint?: string; selected: boolean; onClick: () => void }) {
  return (
    <m.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.97 }}
      aria-pressed={selected}
      className={cn(
        'rounded-2xl border-2 px-5 py-4 text-left transition-colors',
        selected ? 'border-cream bg-cream text-forest-dark' : 'border-cream/30 hover:border-cream',
      )}
    >
      <span className="block font-display text-xl font-semibold">{label}</span>
      {hint && <span className={cn('mt-0.5 block text-sm', selected ? 'text-forest' : 'text-cream/80')}>{hint}</span>}
    </m.button>
  );
}

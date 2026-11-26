import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, useReducedMotion } from 'motion/react';
import { Die3D } from './fx/Dice';
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
  const reduce = useReducedMotion();
  // After the last answer the dice roll for a moment before the matches are dealt out.
  const [rolling, setRolling] = useState(false);
  useEffect(() => {
    if (!rolling) return;
    const t = setTimeout(() => {
      setRolling(false);
      requestAnimationFrame(() => headingRef.current?.focus());
    }, 1600);
    return () => clearTimeout(t);
  }, [rolling]);

  const go = (next: Step, patch: Partial<QuizAnswers> = {}) => {
    setAnswers((a) => ({ ...a, ...patch }));
    setStep(next);
    if (next === 3 && !reduce) setRolling(true);
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
            key={rolling ? 'roll' : step}
            initial={{ opacity: 0, x: 60, rotate: 2 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            exit={{ opacity: 0, x: -60, rotate: -2 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
          >
            {rolling ? (
              <div className="flex flex-col items-center gap-6 py-6 text-center">
                <div className="flex gap-6">
                  <Die3D seed={Number(answers.players ?? 1)} />
                  <Die3D seed={(answers.mood?.length ?? 2) + 1} delay={0.12} spins={4} />
                </div>
                <p className="font-display text-2xl">Rolling for your table…</p>
              </div>
            ) : step < 3 ? (
              <>
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-cream/75">
                  Question {step + 1} of 3
                </p>
                <h3 ref={headingRef} tabIndex={-1} className="mt-2 text-2xl focus:outline-none">
                  {QUESTIONS[step]}
                </h3>
                <div className="quiz-choices mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
                    {picks.map((g, i) => (
                      <m.li
                        key={g._id}
                        initial={{ rotateY: 180, y: -80, rotate: (i - 1) * 12, opacity: 0, scale: 0.7 }}
                        animate={{ rotateY: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 140, damping: 14, delay: 0.1 + i * 0.18 }}
                        style={{ transformPerspective: 900 }}
                        className="relative"
                      >
                        {i === 0 && (
                          <m.span
                            className="absolute -top-3 left-4 z-20 inline-block rounded-full bg-cta px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lift"
                            initial={{ scale: 0, rotate: -20 }}
                            animate={{ scale: 1, rotate: -6 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 10, delay: 0.8 }}
                          >
                            Best match
                          </m.span>
                        )}
                        <button type="button" onClick={() => onSelect(g)} className="block h-full w-full rounded-card text-left text-forest-dark" aria-label={`${g.name}: see details`}>
                          <GameCard game={g} />
                        </button>
                      </m.li>
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

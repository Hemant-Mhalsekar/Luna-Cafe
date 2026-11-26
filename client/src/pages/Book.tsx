import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/ui/Card';
import { Button, LinkButton } from '../components/ui/Button';
import { Field, SelectField } from '../components/ui/Field';
import { DieIcon } from '../components/illustrations/GameIcons';
import { useAvailability, useCreateReservation, useGames } from '../lib/queries';
import { ApiError } from '../lib/api';
import { BOOKING, addDays, cafeToday, formatDate, isClosedDay } from '../lib/cafe';
import { cn } from '../lib/cn';
import * as m from 'motion/react-m';
import { Scramble } from '../components/fx/Scramble';
import { SplitText as SplitTextInline } from '../components/fx/SplitText';
import type { ReservationConfirmation, SlotSuggestion } from '../lib/types';

function firstOpenDay(from: string): string {
  let d = from;
  while (isClosedDay(d)) d = addDays(d, 1);
  return d;
}

const STATUS_NOTE = { full: 'Full', past: 'Passed', closed: 'Closed', free: '' } as const;

export function Book() {
  const [params] = useSearchParams();
  const today = cafeToday();
  const lastDay = addDays(today, BOOKING.windowDays);

  const [date, setDate] = useState(() => firstOpenDay(today));
  const [partySize, setPartySize] = useState(2);
  const [slotId, setSlotId] = useState('');
  const [gameSlug, setGameSlug] = useState(params.get('game') ?? '');
  const [contact, setContact] = useState({ name: '', email: '', phone: '' });
  const [confirmation, setConfirmation] = useState<ReservationConfirmation | null>(null);

  const games = useGames();
  const availability = useAvailability(date, partySize);
  const booking = useCreateReservation();

  // A chosen time only counts while it is still free for the current date and party size.
  const chosenSlot = availability.data?.find((s) => s.slotId === slotId && s.status === 'free');

  const error = booking.error instanceof ApiError ? booking.error : null;
  const fieldError = (name: string) => error?.fields?.[name];
  const suggestions = error?.code === 'SLOT_FULL' ? ((error.details as { suggestions?: SlotSuggestion[] })?.suggestions ?? []) : [];
  const closed = isClosedDay(date);
  const selectedGame = games.data?.find((g) => g.slug === gameSlug);
  // One copy of each game: show which ones are already reserved at the chosen time.
  const takenGames = new Set(chosenSlot?.takenGameIds ?? []);
  const gameTaken = Boolean(selectedGame && takenGames.has(selectedGame._id));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    booking.mutate(
      { ...contact, date, slotId: chosenSlot?.slotId ?? '', partySize, gameId: selectedGame?._id ?? null },
      {
        onSuccess: (r) => {
          setConfirmation(r);
          window.scrollTo({ top: 0 });
          void import('../lib/confetti').then((c) => c.celebrate());
        },
      },
    );
  };

  if (confirmation) {
    return (
      <Confirmation
        reservation={confirmation}
        gameName={games.data?.find((g) => g._id === confirmation.gameId)?.name}
        email={contact.email}
        onAnother={() => {
          setConfirmation(null);
          setSlotId('');
          booking.reset();
        }}
      />
    );
  }

  return (
    <>
      <PageHeader eyebrow="Book a table" title="Your table is waiting">
        <p>Tables are held for 90 minutes. Pick a day, a time and how many of you are coming. You can reserve a game too.</p>
      </PageHeader>

      <form onSubmit={submit} noValidate className="container-page grid gap-8 pb-20 lg:grid-cols-[1fr_22rem]">
        <div className="stagger-in flex flex-col gap-8">
          <Card className="flex flex-col gap-6">
            <h2 className="text-2xl">1. When and how many</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <Field
                label="Date"
                type="date"
                value={date}
                min={today}
                max={lastDay}
                onChange={(e) => e.target.value && setDate(e.target.value)}
                hint={closed ? undefined : formatDate(date)}
                error={closed ? 'We are closed on Mondays. Please pick another day.' : fieldError('date')}
                required
              />
              <PartySize value={partySize} onChange={setPartySize} />
            </div>

            <fieldset>
              <legend className="mb-3 text-sm font-semibold">Time</legend>
              {availability.isPending && <p className="text-forest">Checking free tables…</p>}
              {availability.isError && <p className="text-error">We couldn't check times just now. Please try again in a moment.</p>}
              {availability.data && (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {availability.data.map((s) => {
                    const free = s.status === 'free';
                    return (
                      <label
                        key={s.slotId}
                        className={cn(
                          'relative flex min-h-16 cursor-pointer flex-col items-center justify-center rounded-2xl border px-3 py-3 text-center transition-[color,background-color,border-color,transform] duration-200 active:scale-95 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-forest-dark',
                          !free && 'cursor-not-allowed border-outline/60 bg-cream-deep/60 text-muted',
                          free && chosenSlot?.slotId === s.slotId && 'slot-pop scale-105 border-forest-dark bg-forest-dark text-cream shadow-lift',
                          free && chosenSlot?.slotId !== s.slotId && 'border-outline-strong/50 bg-card hover:-translate-y-1 hover:border-forest-dark',
                        )}
                      >
                        <input
                          type="radio"
                          name="slot"
                          value={s.slotId}
                          checked={chosenSlot?.slotId === s.slotId}
                          disabled={!free}
                          onChange={() => setSlotId(s.slotId)}
                          className="sr-only"
                        />
                        <span className="font-mono text-base">{s.label}</span>
                        {!free && <span className="text-xs font-medium">{STATUS_NOTE[s.status]}</span>}
                      </label>
                    );
                  })}
                </div>
              )}
              {fieldError('slotId') && <p className="mt-2 text-sm font-medium text-error">{fieldError('slotId')}</p>}
            </fieldset>
          </Card>

          <Card className="flex flex-col gap-6">
            <h2 className="text-2xl">2. Your details</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Name" autoComplete="name" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} error={fieldError('name')} required className="sm:col-span-2" />
              <Field label="Email" type="email" autoComplete="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} error={fieldError('email')} required />
              <Field label="Phone" type="tel" autoComplete="tel" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} error={fieldError('phone')} hint="Only used if we need to reach you about this booking." required />
            </div>
            <SelectField
              label="Reserve a game (optional)"
              value={gameSlug}
              onChange={(e) => setGameSlug(e.target.value)}
              hint={chosenSlot ? `We'll have it waiting on your table. Games marked "taken" are already reserved at ${chosenSlot.label}.` : "We'll have it waiting on your table."}
              error={gameTaken ? `${selectedGame!.name} is already reserved at ${chosenSlot!.label}. Pick another game or another time.` : undefined}
            >
              <option value="">No game, just coffee</option>
              {games.data?.map((g) => {
                const taken = takenGames.has(g._id);
                return (
                  <option key={g._id} value={g.slug} disabled={taken && g.slug !== gameSlug}>
                    {g.name} ({g.minPlayers}–{g.maxPlayers} players){taken ? ' · taken at this time' : ''}
                  </option>
                );
              })}
            </SelectField>
          </Card>
        </div>

        <aside className="slide-in-right lg:sticky lg:top-24 lg:self-start">
          <Card className="flex flex-col gap-4 bg-sage-soft">
            <h2 className="text-2xl">Your booking</h2>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
              <dt className="font-semibold">Date</dt>
              <dd>{closed ? '—' : formatDate(date)}</dd>
              <dt className="font-semibold">Time</dt>
              <dd>{chosenSlot?.label ?? 'Pick a time'}</dd>
              <dt className="font-semibold">Guests</dt>
              <dd>{partySize}</dd>
              <dt className="font-semibold">Game</dt>
              <dd className={gameTaken ? 'text-error' : undefined}>{selectedGame ? `${selectedGame.name}${gameTaken ? ' (taken at this time)' : ''}` : 'None'}</dd>
            </dl>

            {error && error.code !== 'VALIDATION' && (
              <div role="alert" className="rounded-2xl bg-card p-4">
                <p className="font-semibold text-error">{error.message}</p>
                {suggestions.length > 0 && (
                  <>
                    <p className="mt-2 text-sm">These times are still free:</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {suggestions.map((s) => (
                        <Button
                          key={`${s.date}-${s.slotId}`}
                          variant="secondary"
                          className="px-3 py-1.5 text-sm"
                          onClick={() => {
                            setDate(s.date);
                            setSlotId(s.slotId);
                            booking.reset();
                          }}
                        >
                          {s.date === date ? s.label : `${formatDate(s.date).split(' ').slice(0, 3).join(' ')} · ${s.label}`}
                        </Button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
            {error?.code === 'VALIDATION' && (
              <p role="alert" className="font-medium text-error">
                {error.message}
              </p>
            )}

            <Button type="submit" size="lg" className="group w-full" disabled={!chosenSlot || closed || gameTaken || booking.isPending}>
              <DieIcon className={cn('transition-transform duration-500 group-hover:rotate-[200deg]', booking.isPending && 'motion-safe:animate-spin')} />
              {booking.isPending ? 'Booking…' : 'Book this table'}
            </Button>
            <p className="text-sm text-forest">
              More than {BOOKING.maxPartySize} of you? <Link to="/contact" className="font-semibold underline underline-offset-4">Send us a note</Link>.
            </p>
          </Card>
        </aside>
      </form>
    </>
  );
}

function PartySize({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const stepClass =
    'grid size-12 place-items-center rounded-full border border-outline-strong/60 bg-card text-xl font-semibold text-forest-dark hover:border-forest-dark disabled:opacity-40';
  return (
    <div className="flex flex-col gap-1.5">
      <span id="party-label" className="text-sm font-semibold">
        Guests
      </span>
      <div className="flex items-center gap-4" role="group" aria-labelledby="party-label">
        <button type="button" className={stepClass} onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="One fewer guest">
          −
        </button>
        <output aria-live="polite" className="min-w-8 text-center font-display text-3xl font-semibold">
          {value}
        </output>
        <button type="button" className={stepClass} onClick={() => onChange(value + 1)} disabled={value >= BOOKING.maxPartySize} aria-label="One more guest">
          +
        </button>
      </div>
    </div>
  );
}

function Confirmation({ reservation, gameName, email, onAnother }: { reservation: ReservationConfirmation; gameName?: string; email?: string; onAnother: () => void }) {
  const time = `${reservation.slotId.slice(0, 2)}:${reservation.slotId.slice(2)}`;
  const rows: [string, string][] = [
    ['Date', formatDate(reservation.date)],
    ['Time', `${time} (90 min)`],
    ['Guests', String(reservation.partySize)],
    ['Table', `No. ${reservation.tableNumber}`],
    ...(gameName ? ([['Game', gameName]] as [string, string][]) : []),
  ];
  return (
    <div className="container-page flex justify-center py-16 sm:py-24">
      {/* The ticket flips in, the die tumbles onto it, the code rolls like a slot machine. */}
      <m.div
        className="w-full max-w-lg"
        initial={{ rotateX: 80, y: 120, opacity: 0, scale: 0.8 }}
        animate={{ rotateX: 0, y: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 14 }}
        style={{ transformPerspective: 1000 }}
      >
        <Card className="relative overflow-hidden text-center">
          <span aria-hidden="true" className="absolute -left-4 top-1/2 size-8 rounded-full bg-cream" />
          <span aria-hidden="true" className="absolute -right-4 top-1/2 size-8 rounded-full bg-cream" />
          <m.div
            className="twinkle-host mx-auto grid size-16 place-items-center rounded-full bg-sage-soft text-forest-dark"
            initial={{ y: -260, rotate: -720, scale: 2 }}
            animate={{ y: 0, rotate: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 90, damping: 10, delay: 0.35 }}
          >
            <DieIcon className="size-8" />
          </m.div>
          <h1 className="mt-5 text-4xl">
            <SplitTextInline text="Table reserved!" />
          </h1>
          <p className="page-intro mt-2 text-forest">See you soon, {reservation.name.split(' ')[0]}. Keep this code handy.</p>
          {email && <p className="page-intro mt-1 text-sm text-forest">A confirmation with a calendar invite is on its way to {email}.</p>}
          <m.p
            className="mt-6 inline-block rounded-2xl bg-cream px-6 py-3 font-mono text-2xl tracking-wider"
            aria-label={`Reference code ${reservation.referenceCode.split('').join(' ')}`}
            initial={{ scale: 0.6 }}
            animate={{ scale: [0.6, 1.15, 1] }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Scramble text={reservation.referenceCode} duration={1500} />
          </m.p>
          <dl className="mx-auto mt-6 grid max-w-xs grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-left">
            {rows.map(([k, v], i) => (
              <div key={k} className="contents">
                <m.dt className="font-semibold" initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: 'spring', delay: 0.9 + i * 0.12 }}>
                  {k}
                </m.dt>
                <m.dd initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: 'spring', delay: 0.9 + i * 0.12 }}>
                  {v}
                </m.dd>
              </div>
            ))}
          </dl>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button variant="secondary" onClick={onAnother}>
              Book another table
            </Button>
            <LinkButton to="/games">Browse the games</LinkButton>
            <Button variant="ghost" onClick={() => void import('../lib/confetti').then((c) => c.celebrate())}>
              Celebrate again
            </Button>
          </div>
        </Card>
      </m.div>
    </div>
  );
}

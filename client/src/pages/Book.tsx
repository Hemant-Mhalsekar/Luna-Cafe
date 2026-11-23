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

  const submit = (e: FormEvent) => {
    e.preventDefault();
    booking.mutate(
      { ...contact, date, slotId: chosenSlot?.slotId ?? '', partySize, gameId: selectedGame?._id ?? null },
      { onSuccess: (r) => setConfirmation(r) },
    );
  };

  if (confirmation) {
    return (
      <Confirmation
        reservation={confirmation}
        gameName={games.data?.find((g) => g._id === confirmation.gameId)?.name}
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
        <div className="flex flex-col gap-8">
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
                          'relative flex min-h-16 cursor-pointer flex-col items-center justify-center rounded-2xl border px-3 py-3 text-center transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-forest-dark',
                          !free && 'cursor-not-allowed border-outline/60 bg-cream-deep/60 text-muted',
                          free && chosenSlot?.slotId === s.slotId && 'border-forest-dark bg-forest-dark text-cream',
                          free && chosenSlot?.slotId !== s.slotId && 'border-outline-strong/50 bg-card hover:border-forest-dark',
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
            <SelectField label="Reserve a game (optional)" value={gameSlug} onChange={(e) => setGameSlug(e.target.value)} hint="We'll have it waiting on your table.">
              <option value="">No game, just coffee</option>
              {games.data?.map((g) => (
                <option key={g._id} value={g.slug}>
                  {g.name} ({g.minPlayers}–{g.maxPlayers} players)
                </option>
              ))}
            </SelectField>
          </Card>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
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
              <dd>{selectedGame?.name ?? 'None'}</dd>
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

            <Button type="submit" size="lg" className="group w-full" disabled={!chosenSlot || closed || booking.isPending}>
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

function Confirmation({ reservation, gameName, onAnother }: { reservation: ReservationConfirmation; gameName?: string; onAnother: () => void }) {
  const time = `${reservation.slotId.slice(0, 2)}:${reservation.slotId.slice(2)}`;
  return (
    <div className="container-page flex justify-center py-16 sm:py-24">
      <Card className="w-full max-w-lg text-center">
        <div className="twinkle-host mx-auto grid size-16 place-items-center rounded-full bg-sage-soft text-forest-dark">
          <DieIcon className="size-8" />
        </div>
        <h1 className="mt-5 text-4xl">Table reserved!</h1>
        <p className="mt-2 text-forest">See you soon, {reservation.name.split(' ')[0]}. Keep this code handy.</p>
        <p className="mt-6 inline-block rounded-2xl bg-cream px-6 py-3 font-mono text-2xl tracking-wider" aria-label={`Reference code ${reservation.referenceCode.split('').join(' ')}`}>
          {reservation.referenceCode}
        </p>
        <dl className="mx-auto mt-6 grid max-w-xs grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-left">
          <dt className="font-semibold">Date</dt>
          <dd>{formatDate(reservation.date)}</dd>
          <dt className="font-semibold">Time</dt>
          <dd>{time} (90 min)</dd>
          <dt className="font-semibold">Guests</dt>
          <dd>{reservation.partySize}</dd>
          <dt className="font-semibold">Table</dt>
          <dd>No. {reservation.tableNumber}</dd>
          {gameName && (
            <>
              <dt className="font-semibold">Game</dt>
              <dd>{gameName}</dd>
            </>
          )}
        </dl>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button variant="secondary" onClick={onAnother}>
            Book another table
          </Button>
          <LinkButton to="/games">Browse the games</LinkButton>
        </div>
      </Card>
    </div>
  );
}

import { useState, type FormEvent } from 'react';
import * as m from 'motion/react-m';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/ui/Card';
import { Tag } from '../components/ui/Tag';
import { Button } from '../components/ui/Button';
import { Field } from '../components/ui/Field';
import { Modal } from '../components/ui/Modal';
import { Reveal } from '../components/Reveal';
import { LoadError, SkeletonGrid } from '../components/QueryState';
import { ClockIcon, MeepleIcon } from '../components/illustrations/GameIcons';
import { useEventSignup, useEvents } from '../lib/queries';
import { ApiError } from '../lib/api';
import { formatDate } from '../lib/cafe';
import type { PublicEvent } from '../lib/types';

function dateParts(date: string) {
  const d = new Date(`${date}T00:00:00Z`);
  const opt = (o: Intl.DateTimeFormatOptions) => d.toLocaleDateString('en-GB', { ...o, timeZone: 'UTC' });
  return { day: opt({ day: 'numeric' }), month: opt({ month: 'short' }), weekday: opt({ weekday: 'long' }) };
}

function seatsText(e: PublicEvent) {
  if (e.spotsLeft === 0) return 'Full';
  if (e.spotsLeft <= 5) return `Only ${e.spotsLeft} ${e.spotsLeft === 1 ? 'seat' : 'seats'} left`;
  return `${e.spotsLeft} of ${e.capacity} seats left`;
}

export function Events() {
  const events = useEvents();
  const [chosen, setChosen] = useState<PublicEvent | null>(null);

  return (
    <>
      <PageHeader eyebrow="Events" title="Game nights and tournaments">
        <p>Join a table of new friends, or bring your crew and compete. Every event includes a drink and someone to teach the rules.</p>
      </PageHeader>

      <div className="container-page pb-20">
        {events.isPending && <SkeletonGrid count={4} className="grid gap-5 md:grid-cols-2" item={<div className="h-56 rounded-card bg-cream-deep" />} />}
        {events.isError && <LoadError what="events" onRetry={() => events.refetch()} />}
        {events.data?.length === 0 && <Card>New events are being planned. Check back soon.</Card>}
        {events.data && events.data.length > 0 && (
          <ul className="grid gap-5 md:grid-cols-2">
            {events.data.map((e, i) => {
              const p = dateParts(e.date);
              const full = e.spotsLeft === 0;
              return (
                <li key={e._id}>
                  <Reveal delay={0.1 * i} variant={i % 2 ? 'right' : 'left'} className="h-full">
                    <Card className="group flex h-full gap-5 transition-[transform,box-shadow] duration-300 hover:-translate-y-1.5 hover:shadow-lift">
                      <m.div
                        initial={{ rotateY: 180, scale: 0.5 }}
                        whileInView={{ rotateY: 0, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ type: 'spring', stiffness: 160, damping: 14, delay: 0.25 + 0.1 * i }}
                        style={{ transformPerspective: 600 }}
                        className="flex size-20 shrink-0 flex-col items-center justify-center rounded-2xl bg-forest-dark text-cream transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110"
                        aria-hidden="true"
                      >
                        <span className="font-display text-3xl font-semibold leading-none">{p.day}</span>
                        <span className="mt-1 text-sm font-semibold uppercase tracking-wider">{p.month}</span>
                      </m.div>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <Tag tone={e.type === 'tournament' ? 'terracotta' : 'lavender'} className="self-start">
                          {e.type === 'tournament' ? 'Tournament' : 'Game night'}
                        </Tag>
                        <h2 className="mt-3 text-2xl">{e.title}</h2>
                        <p className="mt-2 text-forest">{e.description}</p>
                        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm font-medium">
                          <span className="flex items-center gap-1.5">
                            <ClockIcon className="size-4" /> {p.weekday} {p.day} {p.month}, {e.startTime}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MeepleIcon className="size-4" /> {seatsText(e)}
                            {!full && e.spotsLeft <= 5 && (
                              <span className="relative ml-1 flex size-2.5" aria-hidden="true">
                                <span className="absolute inline-flex size-full animate-ping rounded-full bg-cta opacity-75" />
                                <span className="relative inline-flex size-2.5 rounded-full bg-cta" />
                              </span>
                            )}
                          </span>
                        </div>
                        {full ? (
                          <Button variant="secondary" className="mt-5 self-start" disabled>
                            Fully booked
                          </Button>
                        ) : (
                          <Button className="mt-5 self-start" onClick={() => setChosen(e)} aria-label={`Sign up for ${e.title}`}>
                            Save my seat
                          </Button>
                        )}
                      </div>
                    </Card>
                  </Reveal>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Modal open={chosen !== null} onClose={() => setChosen(null)} title={chosen?.title ?? ''}>
        {chosen && <SignupForm event={chosen} onDone={() => setChosen(null)} />}
      </Modal>
    </>
  );
}

function SignupForm({ event, onDone }: { event: PublicEvent; onDone: () => void }) {
  const signup = useEventSignup();
  const [form, setForm] = useState({ name: '', email: '' });
  const error = signup.error instanceof ApiError ? signup.error : null;

  if (signup.isSuccess) {
    return (
      <m.div role="status" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 16 }}>
        <p className="text-lg">
          You're on the list, {form.name.split(' ')[0]}! See you on {formatDate(event.date)} at {event.startTime}.
        </p>
        <p className="mt-2 text-forest">Your first drink is on us. Just give your name at the counter. We've emailed the details to {form.email}.</p>
        <Button className="mt-6" onClick={onDone}>
          Lovely, thanks
        </Button>
      </m.div>
    );
  }

  const submit = (e: FormEvent) => {
    e.preventDefault();
    signup.mutate({ slug: event.slug, ...form }, { onSuccess: () => void import('../lib/confetti').then((c) => c.celebrate()) });
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      <p className="text-forest">
        {formatDate(event.date)}, {event.startTime} · {seatsText(event)}
      </p>
      <Field label="Name" autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={error?.fields?.name} required />
      <Field label="Email" type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={error?.fields?.email} hint="So we know who is coming. We never share it." required />
      {error && !error.fields && (
        <p role="alert" className="font-medium text-error">
          {error.message}
        </p>
      )}
      <Button type="submit" size="lg" className="self-start" disabled={signup.isPending}>
        {signup.isPending ? 'Saving…' : 'Save my seat'}
      </Button>
    </form>
  );
}

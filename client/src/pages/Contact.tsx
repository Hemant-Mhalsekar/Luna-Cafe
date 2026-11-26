import { useState, type FormEvent } from 'react';
import { PageHeader } from '../components/PageHeader';
import * as m from 'motion/react-m';
import { Reveal } from '../components/Reveal';
import { Parallax } from '../components/fx/Parallax';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Field, TextAreaField } from '../components/ui/Field';
import { MiniMap } from '../components/MiniMap';
import { ClockIcon, PinIcon } from '../components/illustrations/GameIcons';
import { useSendMessage } from '../lib/queries';
import { ApiError } from '../lib/api';
import { CAFE, PHOTOS } from '../lib/cafe';
import { Photo } from '../components/Photo';

const EMPTY = { name: '', email: '', message: '', website: '' };

export function Contact() {
  const [form, setForm] = useState(EMPTY);
  const send = useSendMessage();
  const error = send.error instanceof ApiError ? send.error : null;
  const fieldError = (k: string) => error?.fields?.[k];

  const submit = (e: FormEvent) => {
    e.preventDefault();
    send.mutate(form, {
      onSuccess: () => {
        setForm(EMPTY);
        void import('../lib/confetti').then((c) => c.burst({ y: 0.4 }));
      },
    });
  };

  return (
    <>
      <PageHeader eyebrow="Contact" title="Say hello">
        <p>Questions, groups of more than eight, birthdays or private events: send us a note and we'll reply within a day.</p>
      </PageHeader>

      <div className="container-page grid gap-8 pb-20 lg:grid-cols-[1fr_26rem]">
        <Reveal variant="left">
        <Card>
          {send.isSuccess ? (
            <m.div role="status" className="py-8 text-center" initial={{ scale: 0.7, opacity: 0, rotate: -4 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 220, damping: 14 }}>
              <m.svg viewBox="0 0 48 48" className="mx-auto mb-4 size-16 text-cta" aria-hidden="true" initial={{ y: 20, rotate: -30 }} animate={{ y: 0, rotate: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 10, delay: 0.15 }}>
                <path d="M6 22 42 6 30 42l-7-14-17-6Z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
                <path d="m23 28 19-22" fill="none" stroke="currentColor" strokeWidth="3" />
              </m.svg>
              <h2 className="text-3xl">Thanks, message received!</h2>
              <p className="mt-2 text-forest">We'll get back to you within a day. Probably with a game suggestion.</p>
              <Button variant="secondary" className="mt-6" onClick={() => send.reset()}>
                Send another
              </Button>
            </m.div>
          ) : (
            <form onSubmit={submit} noValidate className="flex flex-col gap-6">
              <h2 className="text-2xl">Send us a note</h2>
              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Name" autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={fieldError('name')} required />
                <Field label="Email" type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={fieldError('email')} required />
              </div>
              <TextAreaField label="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} error={fieldError('message')} maxLength={2000} required />
              {/* Honeypot for bots: hidden from people and screen readers. */}
              <div aria-hidden="true" className="absolute -left-[9999px]">
                <label>
                  Website
                  <input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
                </label>
              </div>
              {error && error.code !== 'VALIDATION' && (
                <p role="alert" className="font-medium text-error">
                  {error.message}
                </p>
              )}
              <Button type="submit" size="lg" className="self-start" disabled={send.isPending}>
                {send.isPending ? 'Sending…' : 'Send message'}
              </Button>
            </form>
          )}
        </Card>
        </Reveal>

        <div className="flex flex-col gap-5">
          <Reveal variant="right" delay={0.1}>
          <Card className="flex flex-col gap-4">
            <h2 className="text-2xl">Visit</h2>
            <div className="flex gap-3">
              <PinIcon className="mt-0.5 size-6 shrink-0 text-forest" />
              <address className="not-italic">
                {CAFE.address.map((l) => (
                  <span key={l} className="block">
                    {l}
                  </span>
                ))}
              </address>
            </div>
            {CAFE.hours.map((h) => (
              <div key={h.days} className="flex gap-3">
                <ClockIcon className="mt-0.5 size-6 shrink-0 text-forest" />
                <span>
                  <span className="block font-semibold">{h.days}</span>
                  <span className="text-forest">{h.time}</span>
                </span>
              </div>
            ))}
            <p>
              <a className="font-semibold underline underline-offset-4" href={`mailto:${CAFE.email}`}>
                {CAFE.email}
              </a>
              <br />
              <a className="font-semibold underline underline-offset-4" href={`tel:${CAFE.phone.replace(/\s/g, '')}`}>
                {CAFE.phone}
              </a>
            </p>
          </Card>
          </Reveal>
          <Reveal variant="tilt" delay={0.2}>
            <Parallax speed={0.1} zoom className="aspect-[4/3] w-full rounded-card shadow-soft">
              <Photo {...PHOTOS.storefront} className="size-full" />
            </Parallax>
          </Reveal>
          <Reveal variant="zoom" delay={0.3}>
            <MiniMap />
          </Reveal>
        </div>
      </div>
    </>
  );
}

import { useState, type FormEvent } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Field, TextAreaField } from '../components/ui/Field';
import { MiniMap } from '../components/MiniMap';
import { ClockIcon, PinIcon } from '../components/illustrations/GameIcons';
import { useSendMessage } from '../lib/queries';
import { ApiError } from '../lib/api';
import { CAFE } from '../lib/cafe';

const EMPTY = { name: '', email: '', message: '', website: '' };

export function Contact() {
  const [form, setForm] = useState(EMPTY);
  const send = useSendMessage();
  const error = send.error instanceof ApiError ? send.error : null;
  const fieldError = (k: string) => error?.fields?.[k];

  const submit = (e: FormEvent) => {
    e.preventDefault();
    send.mutate(form, { onSuccess: () => setForm(EMPTY) });
  };

  return (
    <>
      <PageHeader eyebrow="Contact" title="Say hello">
        <p>Questions, groups of more than eight, birthdays or private events: send us a note and we'll reply within a day.</p>
      </PageHeader>

      <div className="container-page grid gap-8 pb-20 lg:grid-cols-[1fr_26rem]">
        <Card>
          {send.isSuccess ? (
            <div role="status" className="py-8 text-center">
              <h2 className="text-3xl">Thanks, message received!</h2>
              <p className="mt-2 text-forest">We'll get back to you within a day. Probably with a game suggestion.</p>
              <Button variant="secondary" className="mt-6" onClick={() => send.reset()}>
                Send another
              </Button>
            </div>
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

        <div className="flex flex-col gap-5">
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
          <MiniMap />
        </div>
      </div>
    </>
  );
}

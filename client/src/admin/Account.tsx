import { useState, type FormEvent } from 'react';
import { useChangePassword, useMe } from './api';
import { AdminHeader } from './shared';
import { Card } from '../components/ui/Card';
import { Field } from '../components/ui/Field';
import { Button } from '../components/ui/Button';
import { ApiError } from '../lib/api';

const EMPTY = { currentPassword: '', newPassword: '', confirm: '' };

export function Account() {
  const me = useMe();
  const change = useChangePassword();
  const [form, setForm] = useState(EMPTY);
  const [mismatch, setMismatch] = useState(false);
  const error = change.error instanceof ApiError ? change.error : null;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) {
      setMismatch(true);
      return;
    }
    setMismatch(false);
    change.mutate(
      { currentPassword: form.currentPassword, newPassword: form.newPassword },
      { onSuccess: () => setForm(EMPTY) },
    );
  };

  return (
    <>
      <AdminHeader title="Account" subtitle={me.data?.email} />
      <Card className="max-w-lg">
        <h2 className="text-2xl">Change password</h2>
        <p className="mt-1 text-forest">At least 12 characters. A few random words work well. Other signed-in devices will be signed out.</p>
        {change.isSuccess && (
          <p role="status" className="mt-4 rounded-2xl bg-sage-soft px-4 py-3 font-medium">
            Password changed. You're still signed in here; other devices have been signed out.
          </p>
        )}
        <form onSubmit={submit} noValidate className="mt-6 flex flex-col gap-5">
          <Field
            label="Current password"
            type="password"
            autoComplete="current-password"
            value={form.currentPassword}
            onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
            error={error?.fields?.currentPassword}
            required
          />
          <Field
            label="New password"
            type="password"
            autoComplete="new-password"
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            error={error?.fields?.newPassword}
            hint="At least 12 characters."
            minLength={12}
            required
          />
          <Field
            label="Repeat new password"
            type="password"
            autoComplete="new-password"
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            error={mismatch ? "The two new passwords don't match." : undefined}
            required
          />
          {error && !error.fields && (
            <p role="alert" className="font-medium text-error">
              {error.message}
            </p>
          )}
          <Button type="submit" className="self-start" disabled={change.isPending}>
            {change.isPending ? 'Saving…' : 'Change password'}
          </Button>
        </form>
      </Card>
    </>
  );
}

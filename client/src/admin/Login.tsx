import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router';
import { useLogin, useMe } from './api';
import { Card } from '../components/ui/Card';
import { Field } from '../components/ui/Field';
import { Button } from '../components/ui/Button';
import { MoonMark } from '../components/illustrations/Logo';
import { ApiError } from '../lib/api';

export function Login() {
  const [params] = useSearchParams();
  const next = params.get('next')?.startsWith('/admin') ? params.get('next')! : '/admin';
  const navigate = useNavigate();
  const me = useMe();
  const login = useLogin();
  const [form, setForm] = useState({ email: '', password: '' });

  if (me.data) return <Navigate to={next} replace />;

  const error = login.error instanceof ApiError ? login.error : null;
  const submit = (e: FormEvent) => {
    e.preventDefault();
    login.mutate(form, { onSuccess: () => navigate(next, { replace: true }) });
  };

  return (
    <div className="grid min-h-dvh place-items-center bg-cream px-5 py-12">
      <title>Sign in · Luna admin</title>
      <meta name="robots" content="noindex, nofollow" />
      <Card className="w-full max-w-sm">
        <div className="twinkle-host flex flex-col items-center text-center">
          <MoonMark className="size-12" />
          <h1 className="mt-4 text-3xl">Staff sign in</h1>
          <p className="mt-1 text-forest">Luna Café admin</p>
        </div>
        <form onSubmit={submit} noValidate className="mt-8 flex flex-col gap-5">
          <Field label="Email" type="email" autoComplete="username" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={error?.fields?.email} required autoFocus />
          <Field label="Password" type="password" autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} error={error?.fields?.password} required />
          {error && !error.fields && (
            <p role="alert" className="font-medium text-error">
              {error.code === 'NETWORK' || error.status >= 500 ? "The café's server isn't answering yet. It may be waking up; try again in a minute." : error.message}
            </p>
          )}
          <Button type="submit" size="lg" disabled={login.isPending}>
            {login.isPending ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </Card>
    </div>
  );
}

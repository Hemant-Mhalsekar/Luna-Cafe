import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

interface ShellProps {
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  id?: string;
  children: (control: { id: string; describedBy?: string; invalid: boolean }) => ReactNode;
}

/** Label + control + hint/error. Errors and hints are linked with aria-describedby. */
function FieldShell({ label, error, hint, className, id, children }: ShellProps) {
  const autoId = useId();
  const controlId = id ?? autoId;
  const hintId = hint ? `${controlId}-hint` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={controlId} className="text-sm font-semibold text-forest-dark">
        {label}
      </label>
      {children({ id: controlId, describedBy: [hintId, errorId].filter(Boolean).join(' ') || undefined, invalid: Boolean(error) })}
      {hint && !error && (
        <p id={hintId} className="text-sm text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm font-medium text-error">
          {error}
        </p>
      )}
    </div>
  );
}

const controlClass = (invalid: boolean) =>
  cn(
    'w-full rounded-2xl border bg-card px-4 py-3 text-forest-dark placeholder:text-muted/70 transition-colors',
    'focus:border-forest-dark focus:outline-none focus-visible:outline-2 focus-visible:outline-forest-dark',
    invalid ? 'border-error' : 'border-outline-strong/60',
  );

type Common = { label: string; error?: string; hint?: string; className?: string };

export function Field({ label, error, hint, className, id, ...rest }: Common & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FieldShell label={label} error={error} hint={hint} className={className} id={id}>
      {(c) => <input id={c.id} aria-invalid={c.invalid || undefined} aria-describedby={c.describedBy} className={controlClass(c.invalid)} {...rest} />}
    </FieldShell>
  );
}

export function TextAreaField({ label, error, hint, className, id, ...rest }: Common & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <FieldShell label={label} error={error} hint={hint} className={className} id={id}>
      {(c) => (
        <textarea id={c.id} aria-invalid={c.invalid || undefined} aria-describedby={c.describedBy} className={cn(controlClass(c.invalid), 'min-h-36 resize-y')} {...rest} />
      )}
    </FieldShell>
  );
}

export function SelectField({ label, error, hint, className, id, children, ...rest }: Common & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <FieldShell label={label} error={error} hint={hint} className={className} id={id}>
      {(c) => (
        <select id={c.id} aria-invalid={c.invalid || undefined} aria-describedby={c.describedBy} className={cn(controlClass(c.invalid), 'appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23294632%27 stroke-width=%272%27%3E%3Cpath d=%27m6 9 6 6 6-6%27/%3E%3C/svg%3E")] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat pr-11')} {...rest}>
          {children}
        </select>
      )}
    </FieldShell>
  );
}

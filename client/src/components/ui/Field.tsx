import { useId, type InputHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

/** Labelled input. Errors and hints are linked with aria-describedby so screen readers announce them. */
export function Field({ label, error, hint, className, id, ...rest }: FieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={inputId} className="text-sm font-semibold text-forest-dark">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
        className={cn(
          'rounded-2xl border bg-card px-4 py-3 text-forest-dark placeholder:text-muted/70 transition-colors',
          'focus:border-forest-dark focus:outline-none focus-visible:outline-2 focus-visible:outline-forest-dark',
          error ? 'border-error' : 'border-outline-strong/60',
        )}
        {...rest}
      />
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

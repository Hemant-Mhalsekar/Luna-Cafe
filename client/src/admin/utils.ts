import { ApiError } from '../lib/api';

export function errorMessage(err: unknown): string | null {
  if (!err) return null;
  return err instanceof ApiError ? err.message : 'Something went wrong.';
}

export function fieldErrors(err: unknown): Record<string, string> {
  return err instanceof ApiError && err.fields ? err.fields : {};
}

export const th = 'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-forest';
export const td = 'px-4 py-3 align-top';

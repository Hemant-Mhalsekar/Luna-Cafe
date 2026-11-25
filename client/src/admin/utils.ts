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

/** "26 Nov, 14:05" in café time (UTC+5:30), for when a booking was made. */
export function bookedAt(iso: string): string {
  const d = new Date(new Date(iso).getTime() + 330 * 60_000);
  const month = d.toLocaleString('en-GB', { month: 'short', timeZone: 'UTC' });
  return `${d.getUTCDate()} ${month}, ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
}

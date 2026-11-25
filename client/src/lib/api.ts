/** Small fetch wrapper. In dev, Vite proxies /api to the server; in production, Vercel rewrites it. */
export class ApiError extends Error {
  status: number;
  code: string;
  fields?: Record<string, string>;
  details?: unknown;

  constructor(status: number, code: string, message: string, fields?: Record<string, string>, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
    this.details = details;
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      credentials: 'include',
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    });
  } catch {
    throw new ApiError(0, 'NETWORK', 'We could not reach the café. Please check your connection.');
  }
  const body = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    const e = body?.error ?? {};
    throw new ApiError(res.status, e.code ?? 'UNKNOWN', e.message ?? 'Something went wrong.', e.fields, e.details);
  }
  return body as T;
}

/**
 * Render's free plan sleeps when idle and takes about a minute to wake. While it does, requests fail
 * with a network error or a 502/503/504 from the proxy. These are worth waiting for; real errors
 * (4xx, 500) are not.
 */
export function isWakingUp(err: unknown): boolean {
  return err instanceof ApiError && (err.status === 0 || err.status === 502 || err.status === 503 || err.status === 504);
}

const WAKE_RETRY_MS = 5000;
const WAKE_MAX_ATTEMPTS = 30; // 30 × 5 s = 2.5 minutes, longer than a cold start

/** Retry policy for reads: keep trying while the API wakes up, otherwise retry once. */
export function retryWhileWaking(failureCount: number, err: unknown): boolean {
  if (isWakingUp(err)) return failureCount < WAKE_MAX_ATTEMPTS;
  if (err instanceof ApiError && err.status >= 400 && err.status < 500) return false;
  return failureCount < 1;
}

/**
 * Retry policy for writes (bookings, sign-ups, messages). Only when the request clearly never reached
 * the app (network error, or Render's 502/503 "loading" answer), so nothing is saved twice.
 */
export function retryWriteWhileWaking(failureCount: number, err: unknown): boolean {
  return err instanceof ApiError && (err.status === 0 || err.status === 502 || err.status === 503) && failureCount < WAKE_MAX_ATTEMPTS;
}

export const wakeRetryDelay = () => WAKE_RETRY_MS;

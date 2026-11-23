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

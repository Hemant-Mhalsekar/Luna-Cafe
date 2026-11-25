import rateLimit from 'express-rate-limit';
import { getEnv } from '../config/env.js';

/**
 * Rate limiter that answers in the API's usual JSON error shape, so the site can show a proper message
 * ("Too many attempts…") instead of a generic error. Skipped in tests.
 */
export function limiter(opts: { minutes: number; limit: number; message: string }) {
  return rateLimit({
    windowMs: opts.minutes * 60_000,
    limit: opts.limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    skip: () => getEnv().NODE_ENV === 'test',
    handler: (_req, res, _next, options) => {
      res.status(options.statusCode).json({ error: { code: 'RATE_LIMITED', message: opts.message } });
    },
  });
}

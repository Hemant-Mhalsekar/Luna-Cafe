import { z } from 'zod';

const EMAIL = z.email();

/** Trims spaces and surrounding quotes, which often sneak in when values are pasted into a dashboard. */
const clean = (v: string | undefined) => (v ?? '').trim().replace(/^["']|["']$/g, '').trim();

/**
 * Optional email settings must never stop the server: a bad value is ignored with a warning in the logs
 * (emails to that address just aren't sent) instead of crashing the whole API on start.
 */
function optionalEmail(name: string) {
  return z
    .string()
    .optional()
    .transform((v) => {
      const value = clean(v);
      if (!value) return undefined;
      if (EMAIL.safeParse(value).success) return value;
      console.warn(`[env] ${name} is not a valid email address, so it is ignored: "${value}"`);
      return undefined;
    });
}

const schema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(4000),
    MONGODB_URI: z
      .string({ error: 'MONGODB_URI is missing. Copy server/.env.example to server/.env and add your connection string.' })
      .refine((v) => v.trim().length > 0, {
        message: 'MONGODB_URI is empty. Add your connection string to server/.env.',
        abort: true,
      })
      .regex(/^mongodb(\+srv)?:\/\//, 'MONGODB_URI must start with mongodb:// or mongodb+srv://'),
    CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
    // How many proxies sit in front of the app. Production: Vercel's /api rewrite, then Render's proxy.
    TRUST_PROXY_HOPS: z.coerce.number().int().min(0).max(5).optional(),
    JWT_SECRET: z.string().optional(),
    ADMIN_EMAIL: z.string().optional(),
    // Email (Brevo HTTP API; Render's free plan blocks SMTP). Without both, emails are only logged.
    BREVO_API_KEY: z.string().optional(),
    MAIL_FROM_ADDRESS: optionalEmail('MAIL_FROM_ADDRESS'),
    MAIL_FROM_NAME: z
      .string()
      .optional()
      .transform((v) => clean(v) || 'Lunaa Café'),
    MAIL_REPLY_TO: optionalEmail('MAIL_REPLY_TO'),
    // Staff alerts for new bookings and event sign-ups (comma-separated for several people).
    ADMIN_NOTIFY_EMAIL: z
      .string()
      .optional()
      .transform((v) =>
        clean(v)
          .split(/[,;\s]+/) // commas, semicolons or spaces between addresses
          .map((e) => clean(e).replace(/^<|>$/g, '')) // "Name <me@example.com>" works too
          .filter(Boolean)
          .filter((e) => {
            const ok = EMAIL.safeParse(e).success;
            if (!ok) console.warn(`[env] ADMIN_NOTIFY_EMAIL contains "${e}", which is not an email address, so it is skipped.`);
            return ok;
          }),
      ),
    SITE_URL: z
      .string()
      .optional()
      .transform((v) => {
        const value = clean(v).replace(/\/+$/, '');
        if (!value) return 'https://lunaacafe.vercel.app';
        const withScheme = /^https?:\/\//.test(value) ? value : `https://${value}`;
        if (z.url().safeParse(withScheme).success) return withScheme;
        console.warn(`[env] SITE_URL "${value}" is not a web address, so the default is used.`);
        return 'https://lunaacafe.vercel.app';
      }),
    ADMIN_PASSWORD: z.string().optional(),
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV === 'production' && (!env.JWT_SECRET || env.JWT_SECRET.length < 32)) {
      ctx.addIssue({ code: 'custom', path: ['JWT_SECRET'], message: 'JWT_SECRET must be at least 32 characters in production.' });
    }
  });

export type Env = z.infer<typeof schema>;

let cached: Env | undefined;

/** Reads and validates process.env once. Exits with a readable message if something is wrong. */
export function getEnv(): Env {
  if (cached) return cached;
  const result = schema.safeParse(process.env);
  if (!result.success) {
    const lines = result.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`);
    throw new Error(`Invalid environment:\n${lines.join('\n')}`);
  }
  cached = result.data;
  return cached;
}

/** Test helper: forget the cached values so a test can change process.env. */
export function resetEnvCache(): void {
  cached = undefined;
}

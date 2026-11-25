import { z } from 'zod';

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

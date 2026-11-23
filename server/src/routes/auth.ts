import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { Admin } from '../models/index.js';
import { AUTH_COOKIE, authCookieOptions, signAdminToken } from '../lib/auth.js';
import { HttpError } from '../lib/httpError.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { getEnv } from '../config/env.js';

export const authRouter = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip: () => getEnv().NODE_ENV === 'test',
});

const loginInput = z.object({
  email: z.string().trim().toLowerCase().min(1, 'Please enter your email.').max(120),
  password: z.string().min(1, 'Please enter your password.').max(200),
});

// Compared against when the email is unknown, so both cases take about the same time.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12);

authRouter.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = loginInput.parse(req.body);
  const admin = await Admin.findOne({ email }).select('+passwordHash');
  const ok = await bcrypt.compare(password, admin?.passwordHash ?? DUMMY_HASH);
  if (!admin || !ok) throw new HttpError(401, 'BAD_CREDENTIALS', 'Email or password is incorrect.');
  res.cookie(AUTH_COOKIE, signAdminToken(String(admin._id)), authCookieOptions());
  res.json({ admin: { email: admin.email } });
});

authRouter.post('/logout', (_req, res) => {
  const { maxAge: _maxAge, ...opts } = authCookieOptions();
  res.clearCookie(AUTH_COOKIE, opts);
  res.status(204).end();
});

authRouter.get('/me', requireAdmin, async (req, res) => {
  const admin = await Admin.findById(req.adminId).lean();
  res.json({ admin: { email: admin!.email } });
});

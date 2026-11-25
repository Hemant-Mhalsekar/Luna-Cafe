import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { getEnv } from './config/env.js';
import { healthRouter } from './routes/health.js';
import { gamesRouter } from './routes/games.js';
import { menuRouter } from './routes/menu.js';
import { reservationsRouter } from './routes/reservations.js';
import { contactRouter } from './routes/contact.js';
import { eventsRouter } from './routes/events.js';
import { authRouter } from './routes/auth.js';
import { adminRouter } from './routes/admin/index.js';
import { errorHandler, notFound } from './middleware/error.js';

export function createApp() {
  const env = getEnv();
  const app = express();

  // Rate limits key on the visitor's IP. In production a request passes Vercel's /api rewrite (which
  // sets X-Forwarded-For to the visitor) and then Render's proxy (which appends Vercel's address), so
  // two hops are trusted. With one, every request looked like it came from a different Vercel server
  // and the limits never added up.
  app.set('trust proxy', env.TRUST_PROXY_HOPS ?? (env.NODE_ENV === 'production' ? 2 : 1));
  app.disable('x-powered-by');

  app.use(helmet());
  app.use(cors({ origin: env.CLIENT_ORIGIN.split(',').map((o) => o.trim()), credentials: true }));
  app.use(express.json({ limit: '20kb' }));
  app.use(cookieParser());

  app.use('/api/health', healthRouter);
  app.use('/api/games', gamesRouter);
  app.use('/api/menu', menuRouter);
  app.use('/api/reservations', reservationsRouter);
  app.use('/api/contact', contactRouter);
  app.use('/api/events', eventsRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/admin', adminRouter);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { Event } from '../models/index.js';
import { HttpError } from '../lib/httpError.js';
import { cafeNow } from '../lib/cafe.js';
import { getEnv } from '../config/env.js';

export const eventsRouter = Router();

const signupLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip: () => getEnv().NODE_ENV === 'test',
});

interface EventLean {
  _id: unknown;
  title: string;
  slug: string;
  type: string;
  date: string;
  startTime: string;
  description: string;
  capacity: number;
  signups: { email: string }[];
}

/** Public view of an event: how many seats are left, never who signed up. */
function toPublic(e: EventLean) {
  const { signups, ...rest } = e;
  return { ...rest, spotsLeft: Math.max(0, e.capacity - signups.length) };
}

eventsRouter.get('/', async (_req, res) => {
  const events = await Event.find({ date: { $gte: cafeNow().date } })
    .sort({ date: 1, startTime: 1 })
    .select('-__v -createdAt -updatedAt')
    .lean<EventLean[]>();
  res.json({ events: events.map(toPublic) });
});

const signupInput = z.object({
  name: z.string().trim().min(2, 'Please tell us your name.').max(80),
  email: z.email('Please enter a valid email.').max(120).transform((e) => e.toLowerCase()),
});

/**
 * One atomic update adds the sign-up only if the event is upcoming, has a free seat and doesn't
 * already have this email. So two people can't both take the last seat.
 */
eventsRouter.post('/:slug/signup', signupLimiter, async (req, res) => {
  const { name, email } = signupInput.parse(req.body);
  const slug = String(req.params.slug);
  const today = cafeNow().date;

  const updated = await Event.findOneAndUpdate(
    {
      slug,
      date: { $gte: today },
      'signups.email': { $ne: email },
      $expr: { $lt: [{ $size: '$signups' }, '$capacity'] },
    },
    { $push: { signups: { name, email } } },
    { returnDocument: 'after' },
  ).lean<EventLean>();

  if (updated) {
    res.status(201).json({ event: toPublic(updated) });
    return;
  }

  // Work out why it didn't go through.
  const event = await Event.findOne({ slug }).lean<EventLean>();
  if (!event) throw new HttpError(404, 'NOT_FOUND', 'We could not find that event.');
  if (event.date < today) throw new HttpError(400, 'EVENT_PAST', 'That event has already happened.');
  if (event.signups.some((s) => s.email === email)) {
    throw new HttpError(409, 'ALREADY_SIGNED_UP', "You're already on the list for this one. See you there!");
  }
  throw new HttpError(409, 'EVENT_FULL', 'Sorry, this event is full.');
});

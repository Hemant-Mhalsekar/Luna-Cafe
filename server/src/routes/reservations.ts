import { Router } from 'express';
import { limiter } from '../lib/rateLimit.js';
import { z } from 'zod';
import { availability, createReservation, reservationInput } from '../services/reservations.js';
import { MAX_PARTY_SIZE, SLOTS } from '../lib/cafe.js';
import { getEnv } from '../config/env.js';
import { sendInBackground } from '../lib/mailer.js';
import { adminNewBooking, bookingConfirmation } from '../emails/templates.js';

export const reservationsRouter = Router();

const bookingLimiter = limiter({ minutes: 15, limit: 20, message: 'Too many booking attempts. Please try again in a few minutes.' });

const availabilityQuery = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Please pick a date.'),
  partySize: z.coerce.number().int().min(1).max(MAX_PARTY_SIZE),
});

reservationsRouter.get('/slots', (_req, res) => {
  res.json({ slots: SLOTS.map(({ id, label }) => ({ slotId: id, label })) });
});

reservationsRouter.get('/availability', async (req, res) => {
  const { date, partySize } = availabilityQuery.parse(req.query);
  res.json({ date, partySize, slots: await availability(date, partySize) });
});

reservationsRouter.post('/', bookingLimiter, async (req, res) => {
  const input = reservationInput.parse(req.body);
  const { reservation, table, gameName } = await createReservation(input);
  const env = getEnv();
  const details = {
    name: reservation.name,
    email: reservation.email,
    referenceCode: reservation.referenceCode,
    date: reservation.date,
    slotId: reservation.slotId,
    partySize: reservation.partySize,
    tableNumber: table.number,
    gameName,
  };
  sendInBackground(bookingConfirmation(details, env.SITE_URL));
  for (const to of env.ADMIN_NOTIFY_EMAIL) {
    sendInBackground(adminNewBooking({ ...details, phone: reservation.phone, bookedAt: reservation.createdAt }, env.SITE_URL, to));
  }
  res.status(201).json({
    reservation: {
      referenceCode: reservation.referenceCode,
      name: reservation.name,
      date: reservation.date,
      slotId: reservation.slotId,
      partySize: reservation.partySize,
      tableNumber: table.number,
      gameId: reservation.gameId,
    },
  });
});

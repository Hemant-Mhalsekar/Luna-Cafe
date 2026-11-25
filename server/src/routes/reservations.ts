import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { availability, createReservation, reservationInput } from '../services/reservations.js';
import { MAX_PARTY_SIZE, SLOTS } from '../lib/cafe.js';
import { Game } from '../models/index.js';
import { getEnv } from '../config/env.js';
import { sendInBackground } from '../lib/mailer.js';
import { bookingConfirmation } from '../emails/templates.js';

export const reservationsRouter = Router();

const bookingLimiter = rateLimit({ windowMs: 15 * 60_000, limit: 20, standardHeaders: 'draft-8', legacyHeaders: false });

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
  const { reservation, table } = await createReservation(input);
  const game = reservation.gameId ? await Game.findById(reservation.gameId).select('name').lean() : null;
  sendInBackground(
    bookingConfirmation(
      {
        name: reservation.name,
        email: reservation.email,
        referenceCode: reservation.referenceCode,
        date: reservation.date,
        slotId: reservation.slotId,
        partySize: reservation.partySize,
        tableNumber: table.number,
        gameName: game?.name ?? null,
      },
      getEnv().SITE_URL,
    ),
  );
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

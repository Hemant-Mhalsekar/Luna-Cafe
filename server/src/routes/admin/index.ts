import { Router } from 'express';
import { z } from 'zod';
import { Types } from 'mongoose';
import { ContactMessage, Event, Game, MenuItem, Reservation } from '../../models/index.js';
import { requireAdmin } from '../../middleware/requireAdmin.js';
import { HttpError } from '../../lib/httpError.js';
import { addDays, cafeNow } from '../../lib/cafe.js';
import { crudRouter } from './crud.js';
import { eventInput, gameInput, menuItemInput } from './schemas.js';

export const adminRouter = Router();
adminRouter.use(requireAdmin);

adminRouter.use('/games', crudRouter(Game, { schema: gameInput, slugFrom: 'name', sort: { name: 1 }, label: 'game' }));
adminRouter.use('/menu', crudRouter(MenuItem, { schema: menuItemInput, slugFrom: 'name', sort: { category: 1, name: 1 }, label: 'menu item' }));
adminRouter.use('/events', crudRouter(Event, { schema: eventInput, slugFrom: 'title', sort: { date: 1, startTime: 1 }, label: 'event' }));

const idParam = (id: string) => {
  if (!Types.ObjectId.isValid(id)) throw new HttpError(400, 'BAD_ID', 'Invalid id.');
  return id;
};

adminRouter.get('/summary', async (_req, res) => {
  const today = cafeNow().date;
  const weekEnd = addDays(today, 6);
  const [todays, week, unread] = await Promise.all([
    Reservation.find({ date: today, status: 'confirmed' }).select('partySize').lean(),
    Reservation.countDocuments({ date: { $gte: today, $lte: weekEnd }, status: 'confirmed' }),
    ContactMessage.countDocuments({ isRead: false }),
  ]);
  res.json({
    today,
    bookingsToday: todays.length,
    guestsToday: todays.reduce((n, r) => n + r.partySize, 0),
    bookingsThisWeek: week,
    unreadMessages: unread,
  });
});

const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const reservationQuery = z.object({
  from: day.optional(),
  to: day.optional(),
  status: z.enum(['confirmed', 'cancelled', 'all']).default('all'),
});

adminRouter.get('/reservations', async (req, res) => {
  const q = reservationQuery.parse(req.query);
  const from = q.from ?? cafeNow().date;
  const to = q.to ?? addDays(from, 30);
  const filter: Record<string, unknown> = { date: { $gte: from, $lte: to } };
  if (q.status !== 'all') filter.status = q.status;
  const items = await Reservation.find(filter)
    .sort({ date: 1, slotId: 1 })
    .populate('tableId', 'number capacity')
    .populate('gameId', 'name')
    .lean();
  res.json({ from, to, items });
});

adminRouter.patch('/reservations/:id/cancel', async (req, res) => {
  const r = await Reservation.findOneAndUpdate(
    { _id: idParam(req.params.id), status: 'confirmed' },
    { status: 'cancelled' },
    { returnDocument: 'after' },
  ).lean();
  if (!r) throw new HttpError(404, 'NOT_FOUND', 'That booking was not found or is already cancelled.');
  res.json({ item: r });
});

adminRouter.get('/messages', async (_req, res) => {
  res.json({ items: await ContactMessage.find().sort({ createdAt: -1 }).limit(200).lean() });
});

adminRouter.patch('/messages/:id', async (req, res) => {
  const { isRead } = z.object({ isRead: z.boolean() }).parse(req.body);
  const m = await ContactMessage.findByIdAndUpdate(idParam(req.params.id), { isRead }, { returnDocument: 'after' }).lean();
  if (!m) throw new HttpError(404, 'NOT_FOUND', 'That message no longer exists.');
  res.json({ item: m });
});

adminRouter.delete('/messages/:id', async (req, res) => {
  const m = await ContactMessage.findByIdAndDelete(idParam(req.params.id));
  if (!m) throw new HttpError(404, 'NOT_FOUND', 'That message no longer exists.');
  res.status(204).end();
});

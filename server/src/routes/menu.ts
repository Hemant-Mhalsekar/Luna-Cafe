import { Router } from 'express';
import { MenuItem, Special } from '../models/index.js';
import { cafeNow } from '../lib/cafe.js';

export const menuRouter = Router();

menuRouter.get('/', async (_req, res) => {
  const items = await MenuItem.find({ isAvailable: true }).sort({ category: 1, name: 1 }).lean();
  res.json({ items });
});

/** Today's special, or the first signature item when nothing is set for today. */
menuRouter.get('/special', async (_req, res) => {
  const today = cafeNow().date;
  const special = await Special.findOne({ date: today }).populate('menuItemId').lean();
  if (special?.menuItemId) {
    res.json({ date: today, item: special.menuItemId, note: special.note ?? null });
    return;
  }
  const fallback = await MenuItem.findOne({ isSignature: true, isAvailable: true }).sort({ name: 1 }).lean();
  res.json({ date: today, item: fallback, note: null });
});

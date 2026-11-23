import { Router } from 'express';
import { Game } from '../models/index.js';
import { HttpError } from '../lib/httpError.js';

export const gamesRouter = Router();

// Filtering happens on the client (the library is small); the API returns what is on the shelf.
gamesRouter.get('/', async (_req, res) => {
  const games = await Game.find({ isAvailable: true }).sort({ name: 1 }).lean();
  res.json({ games });
});

gamesRouter.get('/:slug', async (req, res) => {
  const game = await Game.findOne({ slug: req.params.slug, isAvailable: true }).lean();
  if (!game) throw new HttpError(404, 'NOT_FOUND', 'We could not find that game.');
  res.json({ game });
});

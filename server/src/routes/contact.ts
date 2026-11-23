import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { ContactMessage } from '../models/index.js';

export const contactRouter = Router();

const limiter = rateLimit({ windowMs: 15 * 60_000, limit: 5, standardHeaders: 'draft-8', legacyHeaders: false });

const contactInput = z.object({
  name: z.string().trim().min(2, 'Please tell us your name.').max(80),
  email: z.email('Please enter a valid email.').max(120),
  message: z.string().trim().min(10, 'A little more detail, please (at least 10 characters).').max(2000),
  // Honeypot: hidden from people, often filled in by bots.
  website: z.string().max(200).optional(),
});

contactRouter.post('/', limiter, async (req, res) => {
  const { website, ...input } = contactInput.parse(req.body);
  if (!website) await ContactMessage.create(input);
  res.status(201).json({ ok: true });
});

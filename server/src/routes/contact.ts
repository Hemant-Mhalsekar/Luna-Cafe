import { Router } from 'express';
import { limiter } from '../lib/rateLimit.js';
import { z } from 'zod';
import { ContactMessage } from '../models/index.js';

export const contactRouter = Router();

const contactLimiter = limiter({ minutes: 15, limit: 5, message: 'Too many messages from here. Please try again in a few minutes.' });

const contactInput = z.object({
  name: z.string().trim().min(2, 'Please tell us your name.').max(80),
  email: z.email('Please enter a valid email.').max(120),
  message: z.string().trim().min(10, 'A little more detail, please (at least 10 characters).').max(2000),
  // Honeypot: hidden from people, often filled in by bots.
  website: z.string().max(200).optional(),
});

contactRouter.post('/', contactLimiter, async (req, res) => {
  const { website, ...input } = contactInput.parse(req.body);
  if (!website) await ContactMessage.create(input);
  res.status(201).json({ ok: true });
});

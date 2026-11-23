import { z } from 'zod';
import { GAME_ACCENTS, GAME_MOODS, GAME_TYPES } from '../../models/Game.js';
import { DIETARY_TAGS, MENU_CATEGORIES } from '../../models/MenuItem.js';

const slug = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and dashes.')
  .max(80)
  .optional()
  .or(z.literal(''));

export const gameInput = z.object({
  name: z.string().trim().min(2, 'Please enter a name.').max(80),
  slug,
  type: z.enum(GAME_TYPES),
  minPlayers: z.coerce.number().int().min(1).max(20),
  maxPlayers: z.coerce.number().int().min(1).max(20),
  playTimeMinutes: z.coerce.number().int().min(5).max(300),
  difficulty: z.coerce.number().int().min(1).max(3),
  moods: z.array(z.enum(GAME_MOODS)).default([]),
  description: z.string().trim().min(10, 'Please add a short description.').max(400),
  rulesSummary: z.string().trim().min(10, 'Please add a rules summary.').max(1200),
  accent: z.enum(GAME_ACCENTS),
  isInvented: z.boolean().default(false),
  isAvailable: z.boolean().default(true),
});

export const menuItemInput = z.object({
  name: z.string().trim().min(2, 'Please enter a name.').max(80),
  slug,
  category: z.enum(MENU_CATEGORIES),
  price: z.coerce.number().int().min(0).max(10_000),
  description: z.string().trim().min(5, 'Please add a short description.').max(300),
  dietaryTags: z.array(z.enum(DIETARY_TAGS)).default([]),
  image: z.string().trim().max(300).nullable().optional(),
  isSignature: z.boolean().default(false),
  isAvailable: z.boolean().default(true),
});

export const eventInput = z.object({
  title: z.string().trim().min(3, 'Please enter a title.').max(100),
  slug,
  type: z.enum(['game-night', 'tournament']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the date picker.'),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:MM, e.g. 19:00.'),
  description: z.string().trim().min(10, 'Please add a description.').max(600),
  capacity: z.coerce.number().int().min(1).max(200),
});

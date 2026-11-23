import { Router } from 'express';
import { Types, type Model } from 'mongoose';
import type { z } from 'zod';
import { HttpError } from '../../lib/httpError.js';
import { slugify } from '../../lib/slug.js';

interface CrudOptions {
  schema: z.ZodObject;
  /** Field used to build the slug when none is given ("name" or "title"). */
  slugFrom: string;
  sort: Record<string, 1 | -1>;
  label: string;
}

function assertId(id: string) {
  if (!Types.ObjectId.isValid(id)) throw new HttpError(400, 'BAD_ID', 'Invalid id.');
}

function isDuplicate(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as { code?: number }).code === 11000;
}

/** List, create, update and delete for one admin-managed collection. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function crudRouter(model: Model<any>, { schema, slugFrom, sort, label }: CrudOptions) {
  const router = Router();
  const partial = schema.partial();

  router.get('/', async (_req, res) => {
    res.json({ items: await model.find().sort(sort).lean() });
  });

  router.post('/', async (req, res) => {
    const input = schema.parse(req.body) as Record<string, unknown>;
    input.slug = input.slug || slugify(String(input[slugFrom] ?? ''));
    try {
      const doc = await model.create(input);
      res.status(201).json({ item: doc.toObject() });
    } catch (err) {
      if (isDuplicate(err)) throw new HttpError(409, 'SLUG_TAKEN', `Another ${label} already uses that name or slug.`);
      throw err;
    }
  });

  router.patch('/:id', async (req, res) => {
    assertId(req.params.id);
    const input = partial.parse(req.body) as Record<string, unknown>;
    if (input.slug === '') delete input.slug;
    const doc = await model.findById(req.params.id);
    if (!doc) throw new HttpError(404, 'NOT_FOUND', `That ${label} no longer exists.`);
    doc.set(input);
    try {
      await doc.save(); // runs schema validators, including cross-field ones
    } catch (err) {
      if (isDuplicate(err)) throw new HttpError(409, 'SLUG_TAKEN', `Another ${label} already uses that slug.`);
      throw err;
    }
    res.json({ item: doc.toObject() });
  });

  router.delete('/:id', async (req, res) => {
    assertId(req.params.id);
    const doc = await model.findByIdAndDelete(req.params.id);
    if (!doc) throw new HttpError(404, 'NOT_FOUND', `That ${label} no longer exists.`);
    res.status(204).end();
  });

  return router;
}

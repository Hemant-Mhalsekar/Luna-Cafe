import { Types } from 'mongoose';
import { z } from 'zod';
import { Game, Reservation, Table } from '../models/index.js';
import { HttpError } from '../lib/httpError.js';
import { newReferenceCode } from '../lib/referenceCode.js';
import { MAX_PARTY_SIZE, SLOTS, addDays, cafeNow, checkSlot, parseDate, type Slot } from '../lib/cafe.js';

export const reservationInput = z.object({
  name: z.string().trim().min(2, 'Please tell us your name.').max(80),
  email: z.email('Please enter a valid email.').max(120),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9 ()-]{7,20}$/, 'Please enter a valid phone number.'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Please pick a date.'),
  slotId: z.string().min(1, 'Please pick a time.'),
  partySize: z.coerce
    .number()
    .int()
    .min(1)
    .max(MAX_PARTY_SIZE, `For more than ${MAX_PARTY_SIZE} people, please use the contact form.`),
  gameId: z
    .string()
    .refine((v) => Types.ObjectId.isValid(v), 'Unknown game.')
    .nullish(),
});

export type ReservationInput = z.infer<typeof reservationInput>;

export type SlotStatus = 'free' | 'full' | 'past' | 'closed';

interface TableLite {
  _id: Types.ObjectId;
  number: number;
  capacity: number;
}

async function tablesFor(partySize: number): Promise<TableLite[]> {
  return Table.find({ capacity: { $gte: partySize } })
    .sort({ capacity: 1, number: 1 })
    .lean<TableLite[]>();
}

/** Map of "date|slotId" -> set of table ids that already hold a confirmed booking. */
async function takenTables(dates: string[]): Promise<Map<string, Set<string>>> {
  return (await taken(dates)).tables;
}

/** Tables and games already held by confirmed bookings, keyed by "date|slotId". */
async function taken(dates: string[]) {
  const rows = await Reservation.find({ date: { $in: dates }, status: 'confirmed' })
    .select('date slotId tableId gameId')
    .lean();
  const tables = new Map<string, Set<string>>();
  const games = new Map<string, Set<string>>();
  for (const r of rows) {
    const key = `${r.date}|${r.slotId}`;
    if (!tables.has(key)) tables.set(key, new Set());
    tables.get(key)!.add(String(r.tableId));
    if (r.gameId) {
      if (!games.has(key)) games.set(key, new Set());
      games.get(key)!.add(String(r.gameId));
    }
  }
  return { tables, games };
}

function hasFreeTable(tables: TableLite[], taken: Set<string> | undefined): boolean {
  return tables.some((t) => !taken?.has(String(t._id)));
}

/** Every slot on a date with its status for a given party size. */
export async function availability(date: string, partySize: number, now: Date = new Date()) {
  if (!parseDate(date)) throw new HttpError(400, 'INVALID_DATE', 'Please pick a valid date.');
  const [tables, held] = await Promise.all([tablesFor(partySize), taken([date])]);
  return SLOTS.map((slot) => {
    const key = `${date}|${slot.id}`;
    const check = checkSlot(date, slot.id, now);
    let status: SlotStatus;
    if (!check.ok) status = check.code === 'CLOSED' ? 'closed' : 'past';
    else status = hasFreeTable(tables, held.tables.get(key)) ? 'free' : 'full';
    // Games already reserved at this time, so the form can grey them out.
    return { slotId: slot.id, label: slot.label, status, takenGameIds: [...(held.games.get(key) ?? [])] };
  });
}

/** Up to `limit` bookable slots closest in time to the requested one (same day first, then the next days). */
export async function nearestFreeSlots(
  date: string,
  slot: Slot,
  partySize: number,
  limit = 3,
  now: Date = new Date(),
) {
  const days = [0, 1, 2, 3].map((n) => addDays(date, n));
  const [tables, taken] = await Promise.all([tablesFor(partySize), takenTables(days)]);
  const requested = slot.startMinutes;

  const candidates = days.flatMap((d, dayIndex) =>
    SLOTS.filter((s) => !(d === date && s.id === slot.id)).map((s) => ({
      date: d,
      slotId: s.id,
      label: s.label,
      distance: dayIndex * 24 * 60 + Math.abs(s.startMinutes - requested),
    })),
  );
  candidates.sort((a, b) => a.distance - b.distance);

  const result: { date: string; slotId: string; label: string }[] = [];
  for (const c of candidates) {
    if (result.length >= limit) break;
    if (!checkSlot(c.date, c.slotId, now).ok) continue;
    if (hasFreeTable(tables, taken.get(`${c.date}|${c.slotId}`))) {
      result.push({ date: c.date, slotId: c.slotId, label: c.label });
    }
  }
  return result;
}

function gameTaken(gameName: string, time: string) {
  return new HttpError(409, 'GAME_TAKEN', `${gameName} is already reserved at ${time}. Pick another game, or another time.`);
}

function isDuplicateKey(err: unknown): err is { code: number; keyPattern?: Record<string, unknown> } {
  return typeof err === 'object' && err !== null && (err as { code?: unknown }).code === 11000;
}

/**
 * Books the smallest free table that fits the party.
 * The unique index on (tableId, date, slotId) is the real guard: if another request takes the
 * table between our read and our insert, the insert fails and we try the next table.
 */
export async function createReservation(input: ReservationInput, now: Date = new Date()) {
  const check = checkSlot(input.date, input.slotId, now);
  if (!check.ok) throw new HttpError(400, check.code, check.message);

  let gameName: string | null = null;
  if (input.gameId) {
    const game = await Game.findOne({ _id: input.gameId, isAvailable: true }).select('name').lean();
    if (!game) throw new HttpError(400, 'UNKNOWN_GAME', 'That game is not available right now.');
    gameName = game.name;
    const clash = await Reservation.exists({ gameId: input.gameId, date: input.date, slotId: input.slotId, status: 'confirmed' });
    if (clash) throw gameTaken(gameName, check.slot.label);
  }

  const tables = await tablesFor(input.partySize);
  if (tables.length === 0) {
    throw new HttpError(400, 'PARTY_TOO_LARGE', 'We have no table that size. Please use the contact form.');
  }
  const taken = (await takenTables([input.date])).get(`${input.date}|${input.slotId}`);

  for (const table of tables) {
    if (taken?.has(String(table._id))) continue;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const doc = await Reservation.create({
          ...input,
          gameId: input.gameId ?? null,
          tableId: table._id,
          referenceCode: newReferenceCode(),
          status: 'confirmed',
        });
        return { reservation: doc.toObject(), table: { number: table.number, capacity: table.capacity }, gameName };
      } catch (err) {
        if (!isDuplicateKey(err)) throw err;
        if (err.keyPattern && 'referenceCode' in err.keyPattern) continue; // rare code clash: new code
        if (err.keyPattern && 'gameId' in err.keyPattern) throw gameTaken(gameName ?? 'That game', check.slot.label); // taken a moment ago
        break; // someone just took this table: try the next one
      }
    }
  }

  const suggestions = await nearestFreeSlots(input.date, check.slot, input.partySize, 3, now);
  throw new HttpError(409, 'SLOT_FULL', 'Sorry, that time is fully booked.', { suggestions });
}

export { cafeNow };

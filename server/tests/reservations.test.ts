import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { connectDb, disconnectDb } from '../src/db.js';
import { resetEnvCache } from '../src/config/env.js';
import { createApp } from '../src/app.js';
import { Game, Reservation, Table } from '../src/models/index.js';
import { seedCatalog } from '../src/seed/catalog.js';
import { availability, createReservation, type ReservationInput } from '../src/services/reservations.js';
import { HttpError } from '../src/lib/httpError.js';
import { addDays, cafeNow, isClosedDay } from '../src/lib/cafe.js';

// Tuesday 24 Nov 2026, 10:30 café time.
const NOW = new Date('2026-11-24T05:00:00Z');
const DATE = '2026-11-25'; // Wednesday

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongo.getUri('luna-test');
  process.env.NODE_ENV = 'test';
  resetEnvCache();
  await connectDb(process.env.MONGODB_URI);
});

afterAll(async () => {
  await disconnectDb();
  await mongo?.stop();
});

beforeEach(async () => {
  await Promise.all([Reservation.deleteMany({}), Table.deleteMany({}), Game.deleteMany({})]);
  await seedCatalog();
});

const guest = (over: Partial<ReservationInput> = {}): ReservationInput => ({
  name: 'Asha',
  email: 'asha@example.com',
  phone: '+91 98200 00000',
  date: DATE,
  slotId: '1900',
  partySize: 2,
  ...over,
});

async function expectHttpError(p: Promise<unknown>, status: number, code: string) {
  const err = await p.then(
    () => null,
    (e: unknown) => e,
  );
  expect(err).toBeInstanceOf(HttpError);
  expect(err).toMatchObject({ status, code });
  return err as HttpError;
}

describe('createReservation', () => {
  it('gives the smallest table that fits', async () => {
    const { table, reservation } = await createReservation(guest({ partySize: 3 }), NOW);
    expect(table.capacity).toBe(4);
    expect(reservation.referenceCode).toMatch(/^LUNA-/);
    expect(reservation.status).toBe('confirmed');
  });

  it('moves to the next table when the first is taken', async () => {
    const first = await createReservation(guest(), NOW);
    const second = await createReservation(guest({ email: 'b@example.com' }), NOW);
    expect(second.table.number).not.toBe(first.table.number);
    expect(second.table.capacity).toBe(2);
  });

  it('uses a bigger table once all small ones are booked', async () => {
    for (let i = 0; i < 4; i++) await createReservation(guest({ email: `g${i}@example.com` }), NOW);
    const fifth = await createReservation(guest({ email: 'g5@example.com' }), NOW);
    expect(fifth.table.capacity).toBe(4);
  });

  it('blocks double booking even when requests arrive at the same moment', async () => {
    // Only one table seats 8, so only one of these can win.
    const attempts = Array.from({ length: 6 }, (_, i) =>
      createReservation(guest({ partySize: 8, email: `p${i}@example.com` }), NOW),
    );
    const results = await Promise.allSettled(attempts);
    const ok = results.filter((r) => r.status === 'fulfilled');
    const full = results.filter(
      (r) => r.status === 'rejected' && r.reason instanceof HttpError && r.reason.code === 'SLOT_FULL',
    );
    expect(ok).toHaveLength(1);
    expect(full).toHaveLength(5);
    expect(await Reservation.countDocuments({ date: DATE, slotId: '1900', status: 'confirmed' })).toBe(1);
  });

  it('the database index itself refuses a second booking for the same table', async () => {
    const { reservation } = await createReservation(guest(), NOW);
    await expect(
      Reservation.create({ ...guest(), tableId: reservation.tableId, referenceCode: 'LUNA-ZZZZZ' }),
    ).rejects.toMatchObject({ code: 11000 });
  });

  it('frees the slot when a booking is cancelled', async () => {
    const { reservation } = await createReservation(guest({ partySize: 8 }), NOW);
    await Reservation.updateOne({ _id: reservation._id }, { status: 'cancelled' });
    const again = await createReservation(guest({ partySize: 8, email: 'c@example.com' }), NOW);
    expect(again.table.capacity).toBe(8);
  });

  it('returns 409 with the nearest free slots when full', async () => {
    await createReservation(guest({ partySize: 8 }), NOW);
    const err = await expectHttpError(createReservation(guest({ partySize: 8, email: 'x@example.com' }), NOW), 409, 'SLOT_FULL');
    const { suggestions } = err.details as { suggestions: { date: string; slotId: string }[] };
    expect(suggestions).toHaveLength(3);
    expect(suggestions.map((s) => s.slotId)).toEqual(['1730', '2030', '1600']);
    expect(suggestions.every((s) => s.date === DATE)).toBe(true);
  });

  it('refuses past slots, Mondays and party sizes we cannot seat', async () => {
    await expectHttpError(createReservation(guest({ date: '2026-11-24', slotId: '1000' }), NOW), 400, 'PAST');
    await expectHttpError(createReservation(guest({ date: '2026-11-30' }), NOW), 400, 'CLOSED');
    await Table.deleteMany({ capacity: 8 });
    await expectHttpError(createReservation(guest({ partySize: 8 }), NOW), 400, 'PARTY_TOO_LARGE');
  });
});

describe('availability', () => {
  it('marks past, full and free slots', async () => {
    await createReservation(guest({ date: '2026-11-24', slotId: '1300', partySize: 8 }), NOW);
    const slots = await availability('2026-11-24', 8, NOW);
    const byId = Object.fromEntries(slots.map((s) => [s.slotId, s.status]));
    expect(byId['1000']).toBe('past');
    expect(byId['1300']).toBe('full');
    expect(byId['1430']).toBe('free');
  });

  it('marks every slot closed on a Monday', async () => {
    const slots = await availability('2026-11-30', 2, NOW);
    expect(slots.every((s) => s.status === 'closed')).toBe(true);
  });
});

describe('HTTP API', () => {
  // The routes use the real clock, so pick an open day a week from now.
  let openDay = addDays(cafeNow().date, 7);
  while (isClosedDay(openDay)) openDay = addDays(openDay, 1);

  it('GET /api/health reports the database', async () => {
    const res = await request(createApp()).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', db: 'connected' });
  });

  it('GET /api/games lists seeded games', async () => {
    const res = await request(createApp()).get('/api/games');
    expect(res.status).toBe(200);
    expect(res.body.games.length).toBeGreaterThan(10);
  });

  it('POST /api/reservations books and returns a reference code', async () => {
    const res = await request(createApp())
      .post('/api/reservations')
      .send({ ...guest(), date: openDay, partySize: '4' });
    expect(res.status).toBe(201);
    expect(res.body.reservation).toMatchObject({ date: openDay, slotId: '1900', partySize: 4 });
    expect(res.body.reservation.referenceCode).toMatch(/^LUNA-/);
  });

  it('POST /api/reservations returns field errors for bad input', async () => {
    const res = await request(createApp())
      .post('/api/reservations')
      .send({ ...guest(), email: 'nope', partySize: 20, date: openDay });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION');
    expect(Object.keys(res.body.error.fields)).toEqual(expect.arrayContaining(['email', 'partySize']));
  });

  it('unknown routes return 404 JSON', async () => {
    const res = await request(createApp()).get('/api/nope');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

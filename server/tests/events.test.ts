import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { connectDb, disconnectDb } from '../src/db.js';
import { resetEnvCache } from '../src/config/env.js';
import { createApp } from '../src/app.js';
import { Event } from '../src/models/index.js';
import { seedCatalog } from '../src/seed/catalog.js';
import { addDays, cafeNow, isClosedDay } from '../src/lib/cafe.js';
import { setMailTransport, type Mail } from '../src/lib/mailer.js';

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongo.getUri('luna-events-test');
  process.env.NODE_ENV = 'test';
  resetEnvCache();
  await connectDb(process.env.MONGODB_URI);
});

afterAll(async () => {
  await disconnectDb();
  await mongo?.stop();
});

const today = cafeNow().date;

beforeEach(async () => {
  await Event.deleteMany({});
  await Event.create([
    { title: 'Small Night', slug: 'small-night', type: 'game-night', date: addDays(today, 3), startTime: '19:00', description: 'Only three seats here.', capacity: 3 },
    { title: 'Old Night', slug: 'old-night', type: 'game-night', date: addDays(today, -3), startTime: '19:00', description: 'This one is over.', capacity: 10 },
  ]);
});

const signup = (app: ReturnType<typeof createApp>, slug: string, email: string) =>
  request(app).post(`/api/events/${slug}/signup`).send({ name: 'Meera', email });

describe('public events', () => {
  it('lists upcoming events with seats left and no sign-up details', async () => {
    const app = createApp();
    await signup(app, 'small-night', 'a@example.com');
    const res = await request(app).get('/api/events');
    expect(res.status).toBe(200);
    expect(res.body.events.map((e: { slug: string }) => e.slug)).toEqual(['small-night']);
    expect(res.body.events[0].spotsLeft).toBe(2);
    expect(res.body.events[0]).not.toHaveProperty('signups');
  });

  it('signs up once per email (case-insensitive) and emails only the first time', async () => {
    const sent: Mail[] = [];
    setMailTransport(async (m) => {
      sent.push(m);
    });
    const app = createApp();
    expect((await signup(app, 'small-night', 'Sam@Example.com')).status).toBe(201);
    const again = await signup(app, 'small-night', 'sam@example.com');
    setMailTransport(null);
    expect(again.status).toBe(409);
    expect(again.body.error.code).toBe('ALREADY_SIGNED_UP');
    expect(sent).toHaveLength(1);
    expect(sent[0]!.to.email).toBe('sam@example.com');
    expect(sent[0]!.subject).toContain('Small Night');
  });

  it('never overfills, even when people sign up at the same moment', async () => {
    const app = createApp();
    const results = await Promise.all(Array.from({ length: 6 }, (_, i) => signup(app, 'small-night', `p${i}@example.com`)));
    expect(results.filter((r) => r.status === 201)).toHaveLength(3);
    expect(results.filter((r) => r.status === 409 && r.body.error.code === 'EVENT_FULL')).toHaveLength(3);
    const event = await Event.findOne({ slug: 'small-night' }).lean();
    expect(event!.signups).toHaveLength(3);
  });

  it('refuses past and unknown events', async () => {
    const app = createApp();
    expect((await signup(app, 'old-night', 'x@example.com')).body.error.code).toBe('EVENT_PAST');
    expect((await signup(app, 'nope', 'x@example.com')).status).toBe(404);
  });

  it('seeds upcoming sample events on open days', async () => {
    await Event.deleteMany({});
    await seedCatalog();
    const events = await Event.find().lean();
    expect(events).toHaveLength(4);
    for (const e of events) {
      expect(e.date > today).toBe(true);
      expect(isClosedDay(e.date)).toBe(false);
    }
  });
});

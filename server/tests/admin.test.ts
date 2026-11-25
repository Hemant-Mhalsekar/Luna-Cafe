import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { connectDb, disconnectDb } from '../src/db.js';
import { resetEnvCache } from '../src/config/env.js';
import { createApp } from '../src/app.js';
import { Admin, ContactMessage, Game, Reservation, Table } from '../src/models/index.js';
import { seedCatalog } from '../src/seed/catalog.js';
import { addDays, cafeNow, isClosedDay } from '../src/lib/cafe.js';

let mongo: MongoMemoryServer;
const EMAIL = 'admin@lunacafe.local';
const PASSWORD = 'correct horse battery';

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongo.getUri('luna-admin-test');
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-that-is-at-least-32-characters-long';
  resetEnvCache();
  await connectDb(process.env.MONGODB_URI);
});

afterAll(async () => {
  await disconnectDb();
  await mongo?.stop();
});

beforeEach(async () => {
  await Promise.all([Admin.deleteMany({}), Reservation.deleteMany({}), Table.deleteMany({}), Game.deleteMany({}), ContactMessage.deleteMany({})]);
  await seedCatalog();
  await Admin.create({ email: EMAIL, passwordHash: await bcrypt.hash(PASSWORD, 4) });
});

/** Logs in and returns an agent that keeps the session cookie. */
async function signedIn() {
  const agent = request.agent(createApp());
  const res = await agent.post('/api/auth/login').send({ email: EMAIL, password: PASSWORD });
  expect(res.status).toBe(200);
  return agent;
}

describe('auth', () => {
  it('logs in with an httpOnly cookie and reports who is signed in', async () => {
    const agent = request.agent(createApp());
    const res = await agent.post('/api/auth/login').send({ email: 'ADMIN@lunacafe.local ', password: PASSWORD });
    expect(res.status).toBe(200);
    const cookie = String(res.headers['set-cookie']);
    expect(cookie).toMatch(/luna_admin=/);
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Lax/i);
    const me = await agent.get('/api/auth/me');
    expect(me.body).toEqual({ admin: { email: EMAIL } });
  });

  it('gives the same answer for a wrong password and an unknown email', async () => {
    const app = createApp();
    const wrong = await request(app).post('/api/auth/login').send({ email: EMAIL, password: 'nope' });
    const unknown = await request(app).post('/api/auth/login').send({ email: 'who@example.com', password: 'nope' });
    expect(wrong.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(wrong.body).toEqual(unknown.body);
  });

  it('blocks admin routes without a session, and after logout', async () => {
    expect((await request(createApp()).get('/api/admin/summary')).status).toBe(401);
    const agent = await signedIn();
    expect((await agent.get('/api/admin/summary')).status).toBe(200);
    await agent.post('/api/auth/logout');
    expect((await agent.get('/api/admin/summary')).status).toBe(401);
  });

  it('rejects a forged token', async () => {
    const res = await request(createApp()).get('/api/admin/summary').set('Cookie', 'luna_admin=eyJhbGciOiJIUzI1NiJ9.e30.forged');
    expect(res.status).toBe(401);
  });

  it('refuses admin changes that are not sent as JSON (CSRF guard)', async () => {
    const agent = await signedIn();
    const res = await agent.post('/api/admin/games').type('form').send('name=Sneaky');
    expect(res.status).toBe(415);
  });
});

describe('admin games', () => {
  const newGame = {
    name: 'Tea Party Tactics',
    type: 'strategy',
    minPlayers: 2,
    maxPlayers: 4,
    playTimeMinutes: 45,
    difficulty: 2,
    moods: ['brainy'],
    description: 'A polite battle over the last scone.',
    rulesSummary: 'Place teacups, claim scones, never spill. Most scones wins.',
    accent: 'blue',
  };

  it('creates, updates and deletes a game', async () => {
    const agent = await signedIn();
    const created = await agent.post('/api/admin/games').send(newGame);
    expect(created.status).toBe(201);
    expect(created.body.item.slug).toBe('tea-party-tactics');
    const id = created.body.item._id;

    const updated = await agent.patch(`/api/admin/games/${id}`).send({ isAvailable: false, playTimeMinutes: 50 });
    expect(updated.body.item).toMatchObject({ isAvailable: false, playTimeMinutes: 50 });
    // Hidden from the public list once unavailable
    const pub = await request(createApp()).get('/api/games');
    expect(pub.body.games.some((g: { slug: string }) => g.slug === 'tea-party-tactics')).toBe(false);

    expect((await agent.delete(`/api/admin/games/${id}`)).status).toBe(204);
    expect(await Game.exists({ _id: id })).toBeNull();
  });

  it('rejects a duplicate slug and an impossible player range', async () => {
    const agent = await signedIn();
    const dup = await agent.post('/api/admin/games').send({ ...newGame, name: 'UNO' });
    expect(dup.status).toBe(409);
    const uno = await Game.findOne({ slug: 'uno' });
    const bad = await agent.patch(`/api/admin/games/${uno!._id}`).send({ minPlayers: 6, maxPlayers: 3 });
    expect(bad.status).toBe(400);
    expect(bad.body.error.fields).toHaveProperty('maxPlayers');
  });
});

describe('admin reservations and messages', () => {
  let openDay = addDays(cafeNow().date, 3);
  while (isClosedDay(openDay)) openDay = addDays(openDay, 1);

  it('lists bookings and cancelling frees the table', async () => {
    const app = createApp();
    const book = (email: string) =>
      request(app).post('/api/reservations').send({ name: 'Asha', email, phone: '+91 98200 00000', date: openDay, slotId: '1900', partySize: 8 });
    expect((await book('a@example.com')).status).toBe(201);
    expect((await book('b@example.com')).status).toBe(409);

    const agent = await signedIn();
    const list = await agent.get(`/api/admin/reservations?from=${openDay}&to=${openDay}`);
    expect(list.body.items).toHaveLength(1);
    expect(list.body.items[0].tableId.number).toBe(11);

    const cancel = await agent.patch(`/api/admin/reservations/${list.body.items[0]._id}/cancel`).send({});
    expect(cancel.body.item.status).toBe('cancelled');
    expect((await agent.patch(`/api/admin/reservations/${list.body.items[0]._id}/cancel`).send({})).status).toBe(404);
    expect((await book('b@example.com')).status).toBe(201);
  });

  it('lists the latest bookings first, with when they were made', async () => {
    const app = createApp();
    for (const [i, slotId] of ['1300', '1430'].entries()) {
      await request(app).post('/api/reservations').send({ name: `Guest ${i}`, email: `g${i}@example.com`, phone: '+91 98200 00000', date: openDay, slotId, partySize: 2 });
    }
    const agent = await signedIn();
    const res = await agent.get('/api/admin/reservations/recent?limit=5');
    expect(res.status).toBe(200);
    expect(res.body.items.map((r: { name: string }) => r.name)).toEqual(['Guest 1', 'Guest 0']);
    expect(res.body.items[0].createdAt).toBeTruthy();
  });

  it('marks messages read and deletes them', async () => {
    const msg = await ContactMessage.create({ name: 'Ravi', email: 'r@example.com', message: 'Birthday booking please' });
    const agent = await signedIn();
    expect((await agent.get('/api/admin/summary')).body.unreadMessages).toBe(1);
    await agent.patch(`/api/admin/messages/${msg._id}`).send({ isRead: true });
    expect((await agent.get('/api/admin/summary')).body.unreadMessages).toBe(0);
    expect((await agent.delete(`/api/admin/messages/${msg._id}`)).status).toBe(204);
  });
});

describe('change password', () => {
  it('needs the current password and a strong, different new one', async () => {
    const agent = await signedIn();
    const wrong = await agent.post('/api/auth/password').send({ currentPassword: 'nope', newPassword: 'a brand new passphrase' });
    expect(wrong.status).toBe(400);
    expect(wrong.body.error.fields).toHaveProperty('currentPassword');
    const short = await agent.post('/api/auth/password').send({ currentPassword: PASSWORD, newPassword: 'short' });
    expect(short.body.error.fields).toHaveProperty('newPassword');
    const same = await agent.post('/api/auth/password').send({ currentPassword: PASSWORD, newPassword: PASSWORD });
    expect(same.body.error.fields).toHaveProperty('newPassword');
  });

  it('changes it, keeps this session, ends the others, and the new password works', async () => {
    const mine = await signedIn();
    const other = await signedIn();
    // JWT issue times are whole seconds: make sure the change happens in a later second.
    await new Promise((r) => setTimeout(r, 1100));
    const res = await mine.post('/api/auth/password').send({ currentPassword: PASSWORD, newPassword: 'a brand new passphrase' });
    expect(res.status).toBe(200);
    expect((await mine.get('/api/auth/me')).status).toBe(200);
    expect((await other.get('/api/auth/me')).status).toBe(401);

    const app = createApp();
    expect((await request(app).post('/api/auth/login').send({ email: EMAIL, password: PASSWORD })).status).toBe(401);
    expect((await request(app).post('/api/auth/login').send({ email: EMAIL, password: 'a brand new passphrase' })).status).toBe(200);
  });

  it('requires a session', async () => {
    const res = await request(createApp()).post('/api/auth/password').send({ currentPassword: 'x', newPassword: 'y'.repeat(12) });
    expect(res.status).toBe(401);
  });
});

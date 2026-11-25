import { describe, expect, it } from 'vitest';
import { addDays, cafeNow, checkSlot, parseDate } from '../src/lib/cafe.js';
import { REFERENCE_CODE_RE, newReferenceCode } from '../src/lib/referenceCode.js';

// Tuesday 24 Nov 2026, 10:30 in the café (05:00 UTC).
const NOW = new Date('2026-11-24T05:00:00Z');

describe('cafe time rules', () => {
  it('uses café time, not UTC, for "today"', () => {
    // 20:00 UTC on the 24th is already 01:30 on the 25th in the café.
    expect(cafeNow(new Date('2026-11-24T20:00:00Z'))).toEqual({ date: '2026-11-25', minutes: 90 });
  });

  it('rejects impossible dates', () => {
    expect(parseDate('2026-02-30')).toBeNull();
    expect(parseDate('26-11-24')).toBeNull();
    expect(parseDate('2026-11-24')).not.toBeNull();
  });

  it('adds days across month ends', () => {
    expect(addDays('2026-11-30', 2)).toBe('2026-12-02');
  });

  it('accepts a later slot today', () => {
    expect(checkSlot('2026-11-24', '1130', NOW).ok).toBe(true);
  });

  it('rejects a slot that has started', () => {
    expect(checkSlot('2026-11-24', '1000', NOW)).toMatchObject({ ok: false, code: 'PAST' });
    expect(checkSlot('2026-11-22', '2030', NOW)).toMatchObject({ ok: false, code: 'PAST' });
  });

  it('rejects Mondays', () => {
    expect(checkSlot('2026-11-30', '1300', NOW)).toMatchObject({ ok: false, code: 'CLOSED' });
  });

  it('rejects unknown slots and dates beyond 30 days', () => {
    expect(checkSlot('2026-11-25', '1200', NOW)).toMatchObject({ ok: false, code: 'INVALID_SLOT' });
    expect(checkSlot('2026-12-24', '1300', NOW).ok).toBe(true);
    expect(checkSlot('2026-12-25', '1300', NOW)).toMatchObject({ ok: false, code: 'TOO_FAR' });
  });
});

describe('reference codes', () => {
  it('look like LUNA-XXXXX without look-alike characters', () => {
    for (let i = 0; i < 200; i++) expect(newReferenceCode()).toMatch(REFERENCE_CODE_RE);
  });
});

describe('proxy trust', () => {
  it('uses the visitor IP from X-Forwarded-For behind Vercel + Render in production', async () => {
    const { createApp } = await import('../src/app.js');
    const { resetEnvCache } = await import('../src/config/env.js');
    const { default: express } = await import('express');
    const { default: request } = await import('supertest');
    const saved = { ...process.env };
    process.env.MONGODB_URI = 'mongodb://127.0.0.1:1/unused';
    process.env.NODE_ENV = 'production';
    process.env.JWT_SECRET = 'x'.repeat(40);
    delete process.env.TRUST_PROXY_HOPS;
    resetEnvCache();
    const setting = createApp().get('trust proxy');
    process.env = saved;
    resetEnvCache();
    expect(setting).toBe(2);

    // Same setting on a bare app: Vercel sets the visitor (203.0.113.7), Render's proxy appends Vercel (76.76.21.1).
    const probe = express().set('trust proxy', setting).get('/', (req, res) => {
      res.json({ ip: req.ip });
    });
    const res = await request(probe).get('/').set('X-Forwarded-For', '203.0.113.7, 76.76.21.1');
    expect(res.body.ip).toBe('203.0.113.7');
  });
});

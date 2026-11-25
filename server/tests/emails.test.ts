import { afterEach, describe, expect, it, vi } from 'vitest';
import { adminNewBooking, bookingConfirmation, cafeStamp, eventSignupConfirmation, longDate } from '../src/emails/templates.js';
import { sendInBackground, setMailTransport, type Mail } from '../src/lib/mailer.js';
import { resetEnvCache } from '../src/config/env.js';

const SITE = 'https://lunaacafe.vercel.app';
const decode = (m: Mail) => Buffer.from(m.attachments![0]!.content, 'base64').toString();

const booking = {
  name: 'Asha <b>Rao</b>',
  email: 'asha@example.com',
  referenceCode: 'LUNA-7KQ4M',
  date: '2026-11-25',
  slotId: '1900',
  partySize: 4,
  tableNumber: 5,
  gameName: 'Catan',
};

describe('booking confirmation email', () => {
  it('has the code, date, time, table and game in both HTML and text', () => {
    const m = bookingConfirmation(booking, SITE);
    expect(m.to).toEqual({ email: 'asha@example.com', name: 'Asha <b>Rao</b>' });
    expect(m.subject).toBe('Your table at Luna Café: Wednesday 25 November 2026, 19:00 (LUNA-7KQ4M)');
    for (const body of [m.html, m.text]) {
      for (const part of ['LUNA-7KQ4M', 'Wednesday 25 November 2026', '19:00 – 20:30', 'No. 5', 'Catan', 'portfolio demo']) {
        expect(body).toContain(part);
      }
    }
  });

  it('escapes what the guest typed', () => {
    const m = bookingConfirmation(booking, SITE);
    expect(m.html).toContain('Asha!'); // first name only in the heading
    expect(m.html).not.toContain('<b>Rao</b>');
  });

  it('leaves the game row out when no game was reserved', () => {
    const m = bookingConfirmation({ ...booking, gameName: null }, SITE);
    expect(m.text).not.toContain('Game waiting');
  });

  it('attaches a calendar event in UTC (café time is UTC+5:30)', () => {
    const ics = decode(bookingConfirmation(booking, SITE));
    expect(ics).toContain('DTSTART:20261125T133000Z'); // 19:00 IST
    expect(ics).toContain('DTEND:20261125T150000Z'); // 20:30 IST
    expect(ics).toContain('UID:LUNA-7KQ4M@luna-cafe');
    expect(ics.split('\r\n')[0]).toBe('BEGIN:VCALENDAR');
  });
});

describe('event sign-up email', () => {
  it('confirms the seat with a calendar file', () => {
    const m = eventSignupConfirmation({ name: 'Meera Joshi', email: 'meera@example.com', title: 'New Moon Game Night', date: '2026-11-25', startTime: '19:00' }, SITE);
    expect(m.subject).toBe("You're in: New Moon Game Night, Wednesday 25 November 2026");
    expect(m.html).toContain("You&#39;re on the list, Meera!");
    expect(decode(m)).toContain('DTSTART:20261125T133000Z');
  });
});

describe('mailer', () => {
  afterEach(() => {
    setMailTransport(null);
    vi.restoreAllMocks();
  });

  it('never throws to the caller when sending fails', async () => {
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    setMailTransport(async () => {
      throw new Error('Brevo is down');
    });
    expect(() => sendInBackground(bookingConfirmation(booking, SITE))).not.toThrow();
    await new Promise((r) => setTimeout(r, 0));
    expect(errors).toHaveBeenCalledWith(expect.stringContaining('failed to send'), 'Brevo is down');
  });

  it('only logs (sends nothing) when Brevo is not configured', async () => {
    const saved = { ...process.env };
    process.env.MONGODB_URI = 'mongodb://127.0.0.1:1/unused';
    process.env.NODE_ENV = 'development';
    delete process.env.BREVO_API_KEY;
    delete process.env.MAIL_FROM_ADDRESS;
    resetEnvCache();
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const info = vi.spyOn(console, 'info').mockImplementation(() => {});
    sendInBackground(bookingConfirmation(booking, SITE));
    await new Promise((r) => setTimeout(r, 0));
    process.env = saved;
    resetEnvCache();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(info).toHaveBeenCalledWith(expect.stringContaining('not sent'));
  });

  it('posts to Brevo with the API key header when configured', async () => {
    const saved = { ...process.env };
    process.env.MONGODB_URI = 'mongodb://127.0.0.1:1/unused';
    process.env.NODE_ENV = 'production';
    process.env.JWT_SECRET = 'x'.repeat(40);
    process.env.BREVO_API_KEY = 'test-key';
    process.env.MAIL_FROM_ADDRESS = 'hello@example.com';
    resetEnvCache();
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{"messageId":"1"}', { status: 201 }));
    sendInBackground(bookingConfirmation(booking, SITE));
    await new Promise((r) => setTimeout(r, 0));
    process.env = saved;
    resetEnvCache();
    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, init] = fetchSpy.mock.calls[0]!;
    expect(url).toBe('https://api.brevo.com/v3/smtp/email');
    expect((init!.headers as Record<string, string>)['api-key']).toBe('test-key');
    const body = JSON.parse(String(init!.body));
    expect(body.sender).toEqual({ email: 'hello@example.com', name: 'Luna Café' });
    expect(body.to).toEqual([{ email: 'asha@example.com', name: 'Asha <b>Rao</b>' }]);
    expect(body.attachment[0].name).toBe('luna-cafe-booking.ics');
  });
});

it('formats long dates', () => {
  expect(longDate('2026-12-31')).toBe('Thursday 31 December 2026');
});

describe('staff alert email', () => {
  it('says who booked which slot, table and game, and when', () => {
    const m = adminNewBooking({ ...booking, phone: '+91 98200 00000', bookedAt: new Date('2026-11-24T08:35:00Z') }, SITE, 'staff@example.com');
    expect(m.to).toEqual({ email: 'staff@example.com' });
    expect(m.subject).toBe('New booking: Asha <b>Rao</b>, 4 on Wednesday 25 November 2026 at 19:00 (Catan)');
    for (const part of ['Table: No. 5', 'Game: Catan', 'Phone: +91 98200 00000', 'Booked at: 24 Nov, 14:05']) expect(m.text).toContain(part);
    expect(m.html).not.toContain('<b>Rao</b>');
  });

  it('formats booking times in café time', () => {
    expect(cafeStamp(new Date('2026-11-24T20:00:00Z'))).toBe('25 Nov, 01:30');
  });
});

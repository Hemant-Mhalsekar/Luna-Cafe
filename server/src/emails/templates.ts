import { SLOT_LENGTH_MINUTES, findSlot } from '../lib/cafe.js';
import type { Mail } from '../lib/mailer.js';
import { icsEvent } from './calendar.js';
import { button, detailsTable, escapeHtml, footerText, layout } from './layout.js';

const ADDRESS = '14 Crescent Lane, Moonbeam Quarter, Panaji, Goa';

/** "Wednesday 25 November 2026" for a YYYY-MM-DD café date. */
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function longDate(date: string): string {
  // Built by hand: Intl output differs between Node/ICU versions (some add a comma).
  const d = new Date(`${date}T00:00:00Z`);
  return `${DAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? name;

export interface BookingEmailInput {
  name: string;
  email: string;
  referenceCode: string;
  date: string;
  slotId: string;
  partySize: number;
  tableNumber: number;
  gameName?: string | null;
}

export function bookingConfirmation(b: BookingEmailInput, siteUrl: string): Mail {
  const slot = findSlot(b.slotId);
  const time = slot?.label ?? b.slotId;
  const end = slot ? slot.startMinutes + SLOT_LENGTH_MINUTES : 0;
  const endLabel = `${String(Math.floor(end / 60)).padStart(2, '0')}:${String(end % 60).padStart(2, '0')}`;
  const rows: [string, string][] = [
    ['Reference', b.referenceCode],
    ['Date', longDate(b.date)],
    ['Time', `${time} – ${endLabel}`],
    ['Guests', String(b.partySize)],
    ['Table', `No. ${b.tableNumber}`],
  ];
  if (b.gameName) rows.push(['Game waiting on your table', b.gameName]);

  const html = layout({
    siteUrl,
    preheader: `${b.referenceCode} · ${longDate(b.date)} at ${time}`,
    heading: `Table reserved, ${firstName(b.name)}!`,
    body: `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#4A6B4F">Your table at Lunaa Café is booked. Show this code at the counter when you arrive:</p>
<p style="margin:0 0 16px"><span style="display:inline-block;background:#F6EFDF;border-radius:12px;padding:10px 16px;font-family:'Fragment Mono',Menlo,Consolas,monospace;font-size:22px;letter-spacing:2px;color:#294632">${escapeHtml(b.referenceCode)}</span></p>
${detailsTable(rows)}
<p style="margin:18px 0 20px;font-size:14px;line-height:1.6;color:#4A6B4F">Tables are held for 90 minutes. Running late or need to change something? Just reply to this email or <a href="${escapeHtml(siteUrl)}/contact" style="color:#294632">send us a note</a>. The calendar file attached adds it to your calendar.</p>
${button('See the menu', `${siteUrl}/menu`)}`,
  });

  const text = [
    `Table reserved, ${firstName(b.name)}!`,
    '',
    ...rows.map(([k, v]) => `${k}: ${v}`),
    '',
    'Tables are held for 90 minutes. Show the reference code at the counter.',
    `Need to change something? Reply to this email or write to us: ${siteUrl}/contact`,
    footerText(siteUrl),
  ].join('\n');

  const ics = slot
    ? icsEvent({
        uid: `${b.referenceCode}@luna-cafe`,
        date: b.date,
        startMinutes: slot.startMinutes,
        durationMinutes: SLOT_LENGTH_MINUTES,
        title: `Lunaa Café table for ${b.partySize}`,
        description: `Reference ${b.referenceCode}. Table ${b.tableNumber}.${b.gameName ? ` Game: ${b.gameName}.` : ''}`,
        location: ADDRESS,
      })
    : null;

  return {
    to: { email: b.email, name: b.name },
    subject: `Your table at Lunaa Café: ${longDate(b.date)}, ${time} (${b.referenceCode})`,
    html,
    text,
    attachments: ics ? [{ name: 'luna-cafe-booking.ics', content: Buffer.from(ics).toString('base64') }] : undefined,
  };
}

export interface EventEmailInput {
  name: string;
  email: string;
  title: string;
  date: string;
  startTime: string;
}

export function eventSignupConfirmation(e: EventEmailInput, siteUrl: string): Mail {
  const rows: [string, string][] = [
    ['Event', e.title],
    ['Date', longDate(e.date)],
    ['Starts', e.startTime],
    ['Where', ADDRESS],
  ];
  const html = layout({
    siteUrl,
    preheader: `${e.title} · ${longDate(e.date)} at ${e.startTime}`,
    heading: `You're on the list, ${firstName(e.name)}!`,
    body: `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#4A6B4F">We've saved you a seat. Your first drink is on us: just give your name at the counter.</p>
${detailsTable(rows)}
<p style="margin:18px 0 20px;font-size:14px;line-height:1.6;color:#4A6B4F">Can't make it after all? Reply to this email so someone else can have the seat.</p>
${button('See other events', `${siteUrl}/events`)}`,
  });
  const text = [
    `You're on the list, ${firstName(e.name)}!`,
    '',
    ...rows.map(([k, v]) => `${k}: ${v}`),
    '',
    "Your first drink is on us. Can't make it? Reply to this email so someone else can have the seat.",
    footerText(siteUrl),
  ].join('\n');
  const [h, m] = e.startTime.split(':').map(Number) as [number, number];
  const ics = icsEvent({
    uid: `${e.title.replace(/\W+/g, '-').toLowerCase()}-${e.date}-${e.email}@luna-cafe`,
    date: e.date,
    startMinutes: h * 60 + m,
    durationMinutes: 180,
    title: `${e.title} at Lunaa Café`,
    description: 'Your first drink is on us.',
    location: ADDRESS,
  });
  return {
    to: { email: e.email, name: e.name },
    subject: `You're in: ${e.title}, ${longDate(e.date)}`,
    html,
    text,
    attachments: [{ name: 'luna-cafe-event.ics', content: Buffer.from(ics).toString('base64') }],
  };
}

/** "26 Nov, 14:05" in café time, for "booked at" lines. */
export function cafeStamp(d: Date): string {
  const local = new Date(d.getTime() + 330 * 60_000);
  const hh = String(local.getUTCHours()).padStart(2, '0');
  const mm = String(local.getUTCMinutes()).padStart(2, '0');
  return `${local.getUTCDate()} ${MONTHS[local.getUTCMonth()]!.slice(0, 3)}, ${hh}:${mm}`;
}

export interface AdminBookingInput extends BookingEmailInput {
  phone: string;
  bookedAt: Date;
}

/** Staff alert: who booked which slot, table and game, and when they booked it. */
export function adminNewBooking(b: AdminBookingInput, siteUrl: string, to: string): Mail {
  const slot = findSlot(b.slotId);
  const time = slot?.label ?? b.slotId;
  const rows: [string, string][] = [
    ['When', `${longDate(b.date)}, ${time}`],
    ['Guest', b.name],
    ['Party', `${b.partySize} ${b.partySize === 1 ? 'guest' : 'guests'}`],
    ['Table', `No. ${b.tableNumber}`],
    ['Game', b.gameName ?? 'None'],
    ['Email', b.email],
    ['Phone', b.phone],
    ['Reference', b.referenceCode],
    ['Booked at', cafeStamp(b.bookedAt)],
  ];
  const html = layout({
    siteUrl,
    preheader: `${b.name}, ${b.partySize} guests, ${longDate(b.date)} at ${time}`,
    heading: `New booking: ${time}, ${longDate(b.date)}`,
    body: `${detailsTable(rows)}
<p style="margin:20px 0">${button('Open reservations', `${siteUrl}/admin/reservations`)}</p>`,
  });
  return {
    to: { email: to },
    subject: `New booking: ${b.name}, ${b.partySize} on ${longDate(b.date)} at ${time}${b.gameName ? ` (${b.gameName})` : ''}`,
    html,
    text: [`New booking`, '', ...rows.map(([k, v]) => `${k}: ${v}`), '', `${siteUrl}/admin/reservations`].join('\n'),
  };
}

export function adminNewSignup(e: EventEmailInput & { taken: number; capacity: number }, siteUrl: string, to: string): Mail {
  const rows: [string, string][] = [
    ['Event', `${e.title}, ${longDate(e.date)} ${e.startTime}`],
    ['Guest', `${e.name} (${e.email})`],
    ['Seats taken', `${e.taken} of ${e.capacity}`],
  ];
  return {
    to: { email: to },
    subject: `New sign-up: ${e.title} (${e.taken}/${e.capacity})`,
    html: layout({ siteUrl, preheader: `${e.name} signed up`, heading: `New sign-up: ${e.title}`, body: `${detailsTable(rows)}<p style="margin:20px 0">${button('Open events', `${siteUrl}/admin/events`)}</p>` }),
    text: ['New event sign-up', '', ...rows.map(([k, v]) => `${k}: ${v}`)].join('\n'),
  };
}

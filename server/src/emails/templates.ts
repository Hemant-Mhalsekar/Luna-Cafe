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
    body: `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#4A6B4F">Your table at Luna Café is booked. Show this code at the counter when you arrive:</p>
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
        title: `Luna Café table for ${b.partySize}`,
        description: `Reference ${b.referenceCode}. Table ${b.tableNumber}.${b.gameName ? ` Game: ${b.gameName}.` : ''}`,
        location: ADDRESS,
      })
    : null;

  return {
    to: { email: b.email, name: b.name },
    subject: `Your table at Luna Café: ${longDate(b.date)}, ${time} (${b.referenceCode})`,
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
    title: `${e.title} at Luna Café`,
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

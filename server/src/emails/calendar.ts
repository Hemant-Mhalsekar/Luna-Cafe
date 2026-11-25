import { CAFE_TZ_OFFSET_MINUTES } from '../lib/cafe.js';

const pad = (n: number) => String(n).padStart(2, '0');

/** Café-local date + "HH:MM" as an iCalendar UTC timestamp (20261126T090000Z). */
function utcStamp(date: string, minutes: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCMinutes(minutes - CAFE_TZ_OFFSET_MINUTES);
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
}

const escapeIcs = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

/** A minimal .ics event, so the booking can be added to a calendar in one tap. */
export function icsEvent(opts: { uid: string; date: string; startMinutes: number; durationMinutes: number; title: string; description: string; location: string }): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Luna Cafe//Bookings//EN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${opts.uid}`,
    `DTSTAMP:${utcStamp(new Date(Date.now() + CAFE_TZ_OFFSET_MINUTES * 60_000).toISOString().slice(0, 10), 0)}`,
    `DTSTART:${utcStamp(opts.date, opts.startMinutes)}`,
    `DTEND:${utcStamp(opts.date, opts.startMinutes + opts.durationMinutes)}`,
    `SUMMARY:${escapeIcs(opts.title)}`,
    `DESCRIPTION:${escapeIcs(opts.description)}`,
    `LOCATION:${escapeIcs(opts.location)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.join('\r\n') + '\r\n';
}

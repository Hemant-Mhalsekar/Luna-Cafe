/**
 * Café rules: opening days, time slots and booking window.
 * All dates are café-local (Asia/Kolkata, UTC+5:30, no daylight saving) and stored as YYYY-MM-DD strings
 * so a booking never shifts a day because the server runs in UTC.
 */

export const CAFE_TZ_OFFSET_MINUTES = 330;
export const SLOT_LENGTH_MINUTES = 90;
export const BOOKING_WINDOW_DAYS = 30;
export const MAX_PARTY_SIZE = 8;
export const CLOSED_WEEKDAYS = [1]; // 0 = Sunday, 1 = Monday

export interface Slot {
  id: string;
  label: string;
  startMinutes: number;
}

const START_TIMES = ['10:00', '11:30', '13:00', '14:30', '16:00', '17:30', '19:00', '20:30'];

export const SLOTS: Slot[] = START_TIMES.map((t) => {
  const [h, m] = t.split(':').map(Number) as [number, number];
  return { id: t.replace(':', ''), label: t, startMinutes: h * 60 + m };
});

export function findSlot(slotId: string): Slot | undefined {
  return SLOTS.find((s) => s.id === slotId);
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Parses YYYY-MM-DD into a UTC midnight Date, or null if it is not a real calendar date. */
export function parseDate(date: string): Date | null {
  if (!DATE_RE.test(date)) return null;
  const d = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== date) return null;
  return d;
}

export function addDays(date: string, days: number): string {
  const d = parseDate(date);
  if (!d) throw new Error(`Invalid date ${date}`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Today's date and minutes since midnight in café time. */
export function cafeNow(now: Date = new Date()): { date: string; minutes: number } {
  const local = new Date(now.getTime() + CAFE_TZ_OFFSET_MINUTES * 60_000);
  return {
    date: local.toISOString().slice(0, 10),
    minutes: local.getUTCHours() * 60 + local.getUTCMinutes(),
  };
}

export function isClosedDay(date: string): boolean {
  const d = parseDate(date);
  return d ? CLOSED_WEEKDAYS.includes(d.getUTCDay()) : true;
}

export type SlotCheck =
  | { ok: true; slot: Slot }
  | { ok: false; code: 'INVALID_DATE' | 'INVALID_SLOT' | 'CLOSED' | 'PAST' | 'TOO_FAR'; message: string };

/** Is this date + slot open for booking right now? Does not look at tables. */
export function checkSlot(date: string, slotId: string, now: Date = new Date()): SlotCheck {
  if (!parseDate(date)) return { ok: false, code: 'INVALID_DATE', message: 'Please pick a valid date.' };
  const slot = findSlot(slotId);
  if (!slot) return { ok: false, code: 'INVALID_SLOT', message: 'Please pick one of our time slots.' };
  if (isClosedDay(date)) return { ok: false, code: 'CLOSED', message: 'We are closed on Mondays.' };

  const today = cafeNow(now);
  if (date < today.date || (date === today.date && slot.startMinutes <= today.minutes)) {
    return { ok: false, code: 'PAST', message: 'That time has already passed.' };
  }
  if (date > addDays(today.date, BOOKING_WINDOW_DAYS)) {
    return { ok: false, code: 'TOO_FAR', message: `You can book up to ${BOOKING_WINDOW_DAYS} days ahead.` };
  }
  return { ok: true, slot };
}

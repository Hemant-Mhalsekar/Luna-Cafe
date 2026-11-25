import { Event, Game, MenuItem, Table } from '../models/index.js';
import { addDays, cafeNow, parseDate } from '../lib/cafe.js';
import { games, menuItems, retiredMenuSlugs, sampleEvents, tables } from './data.js';

/** Upserts by number/slug, so running it again updates instead of duplicating. */
export async function seedCatalog() {
  await Table.bulkWrite(
    tables.map((t) => ({ updateOne: { filter: { number: t.number }, update: { $set: t }, upsert: true } })),
  );
  await Game.bulkWrite(
    games.map((g) => ({ updateOne: { filter: { slug: g.slug }, update: { $set: g }, upsert: true } })),
  );
  await MenuItem.bulkWrite(
    menuItems.map((m) => ({ updateOne: { filter: { slug: m.slug }, update: { $set: { image: null, ...m } }, upsert: true } })),
  );
  await MenuItem.updateMany({ slug: { $in: retiredMenuSlugs } }, { $set: { isAvailable: false } });
  // Events keep their sign-ups; only the details and date are refreshed.
  const today = cafeNow().date;
  await Event.bulkWrite(
    sampleEvents.map(({ weekday, daysAhead, ...e }) => {
      let date = addDays(today, daysAhead);
      while (parseDate(date)!.getUTCDay() !== weekday) date = addDays(date, 1);
      return { updateOne: { filter: { slug: e.slug }, update: { $set: { ...e, date } }, upsert: true } };
    }),
  );
  return { tables: tables.length, games: games.length, menuItems: menuItems.length, events: sampleEvents.length };
}

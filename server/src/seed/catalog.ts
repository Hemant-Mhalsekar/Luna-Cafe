import { Game, MenuItem, Table } from '../models/index.js';
import { games, menuItems, tables } from './data.js';

/** Upserts by number/slug, so running it again updates instead of duplicating. */
export async function seedCatalog() {
  await Table.bulkWrite(
    tables.map((t) => ({ updateOne: { filter: { number: t.number }, update: { $set: t }, upsert: true } })),
  );
  await Game.bulkWrite(
    games.map((g) => ({ updateOne: { filter: { slug: g.slug }, update: { $set: g }, upsert: true } })),
  );
  await MenuItem.bulkWrite(
    menuItems.map((m) => ({ updateOne: { filter: { slug: m.slug }, update: { $set: m }, upsert: true } })),
  );
  return { tables: tables.length, games: games.length, menuItems: menuItems.length };
}

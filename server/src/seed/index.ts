/**
 * Seeds tables, games and menu items (upsert by number/slug, so it is safe to run again),
 * and creates the admin account from ADMIN_EMAIL / ADMIN_PASSWORD if no admin exists yet.
 * Run with: npm run seed
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { getEnv } from '../config/env.js';
import { connectDb, disconnectDb } from '../db.js';
import { Admin } from '../models/index.js';
import { seedCatalog } from './catalog.js';

async function seedAdmin(email?: string, password?: string): Promise<string> {
  if (await Admin.exists({})) return 'admin already exists (unchanged)';
  if (!email || !password) return 'skipped admin: set ADMIN_EMAIL and ADMIN_PASSWORD in server/.env';
  if (password.length < 12) return 'skipped admin: ADMIN_PASSWORD must be at least 12 characters';
  await Admin.create({ email, passwordHash: await bcrypt.hash(password, 12) });
  return `created admin ${email}`;
}

async function main() {
  const env = getEnv();
  await connectDb(env.MONGODB_URI);
  const counts = await seedCatalog();
  console.log(`Seeded ${counts.tables} tables, ${counts.games} games, ${counts.menuItems} menu items`);
  console.log(await seedAdmin(env.ADMIN_EMAIL, env.ADMIN_PASSWORD));
  await disconnectDb();
}

main().catch(async (err) => {
  console.error(err instanceof Error ? err.message : err);
  await disconnectDb();
  process.exit(1);
});

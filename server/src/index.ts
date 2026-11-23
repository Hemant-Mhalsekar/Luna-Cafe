import 'dotenv/config';
import { getEnv } from './config/env.js';
import { connectDb, disconnectDb } from './db.js';
import { createApp } from './app.js';
import './models/index.js';

async function main() {
  const env = getEnv();
  await connectDb(env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const server = createApp().listen(env.PORT, () => {
    console.log(`Luna Café API on http://localhost:${env.PORT}`);
  });

  const shutdown = async () => {
    server.close();
    await disconnectDb();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});

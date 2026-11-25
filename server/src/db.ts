import mongoose from 'mongoose';

export async function connectDb(uri: string): Promise<typeof mongoose> {
  mongoose.set('strictQuery', true);
  const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000 });
  // Build indexes (including the ones that block double booking) before taking traffic. If one can't be
  // built (e.g. old data breaks a new unique rule), log it and keep serving: the booking code checks too.
  await Promise.all(
    Object.values(conn.models).map((m) =>
      m.init().catch((err: unknown) => {
        console.error(`Index setup failed for ${m.modelName}:`, err instanceof Error ? err.message : err);
      }),
    ),
  );
  return conn;
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
}

export function dbState(): 'connected' | 'connecting' | 'disconnected' {
  const s = mongoose.connection.readyState;
  if (s === 1) return 'connected';
  if (s === 2) return 'connecting';
  return 'disconnected';
}

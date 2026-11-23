import mongoose from 'mongoose';

export async function connectDb(uri: string): Promise<typeof mongoose> {
  mongoose.set('strictQuery', true);
  const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000 });
  // Build indexes (including the one that blocks double booking) before taking traffic.
  await Promise.all(Object.values(conn.models).map((m) => m.init()));
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

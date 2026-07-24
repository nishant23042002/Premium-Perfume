import mongoose from "mongoose";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var _mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global._mongooseCache ?? { conn: null, promise: null };
global._mongooseCache = cache;

export async function connectToDatabase() {
  if (cache.conn) return cache.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Missing MONGODB_URI environment variable");
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(uri, {
      dbName: process.env.MONGODB_DB_NAME ?? "premium-perfume",
      // autoIndex re-verifies every index on every model the first time
      // that model is touched in a fresh process — harmless on a
      // long-running server, but on a cold serverless instance the home
      // page alone touches ~10 models, and each one pays an extra Atlas
      // round trip just to confirm indexes that already exist. Indexes are
      // created deliberately via a sync script, not implicitly on boot, so
      // this is pure overhead in production.
      autoIndex: process.env.NODE_ENV !== "production",
      // Serverless-appropriate pool sizing: a cold instance handles very
      // few concurrent requests, and won't stay alive long enough to
      // benefit from a large idle pool — a big default pool (100) just
      // means more simultaneous connection setup work competing for the
      // same cold-start time budget.
      maxPoolSize: 10,
      minPoolSize: 0,
      // Fail fast rather than hang if Atlas is briefly unreachable, instead
      // of the driver's much longer default.
      serverSelectionTimeoutMS: 10000,
    });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}

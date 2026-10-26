import mongoose from "mongoose";
import { getEnv } from "@/lib/env";
declare global {
  var mongooseCache:
    { connection: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
}
const cache = global.mongooseCache ?? (global.mongooseCache = { connection: null, promise: null });
export async function connectDb() {
  if (cache.connection) return cache.connection;
  if (!cache.promise)
    cache.promise = mongoose.connect(getEnv("MONGODB_URI"), {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
    });
  try {
    cache.connection = await cache.promise;
    return cache.connection;
  } catch (error) {
    cache.promise = null;
    throw error;
  }
}

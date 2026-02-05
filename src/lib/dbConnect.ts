import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("❌ MONGODB_URI not found in environment. Set MONGODB_URI in .env.local");
}

// Avoid printing full URI (secrets) in logs — print first chars for debugging
console.log("🔥 MONGODB_URI (preview) =", MONGODB_URI.slice(0, 60));

let cached = (global as any).mongoose;
if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export default async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = (async () => {
      try {
        const conn = await mongoose.connect(MONGODB_URI);
        console.log("✅ MongoDB Connected to DB:", conn.connection.name || "(unknown)");
        return conn;
      } catch (err) {
        console.error("❌ MongoDB connection error:", err);
        throw new Error(`MongoDB connection failed: ${err instanceof Error ? err.message : String(err)}. Check MONGODB_URI, network access (IP whitelist), and credentials.`);
      }
    })();
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

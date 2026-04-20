import mongoose from "mongoose";

const BlacklistTokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

// 🔥 Auto delete after expiry (Mongo TTL index)
BlacklistTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.BlacklistToken ||
  mongoose.model("BlacklistToken", BlacklistTokenSchema);
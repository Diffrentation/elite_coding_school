import fs from "node:fs";
import mongoose from "mongoose";

const env = fs.readFileSync(".env.local", "utf8");
const uri = env.match(/^MONGODB_URI=(.+)$/m)?.[1]?.trim();
if (!uri) throw new Error("MONGODB_URI is missing from .env.local");

await mongoose.connect(uri);
const result = await mongoose.connection.collection("courses").updateMany(
  { monthlyFee: { $gte: 2000 } },
  { $set: { monthlyFee: 1900, updatedAt: new Date() } },
);
await mongoose.disconnect();

console.log(`Updated ${result.modifiedCount} course fee(s) to ₹1,900/month.`);

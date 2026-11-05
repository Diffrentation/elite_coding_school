import fs from "node:fs";
import mongoose from "mongoose";

const adminEmail = "bbhupender100@gmail.com";
const env = fs.readFileSync(".env.local", "utf8");
const uri = env.match(/^MONGODB_URI=(.+)$/m)?.[1]?.trim();
if (!uri) throw new Error("MONGODB_URI is missing from .env.local");

await mongoose.connect(uri);
const result = await mongoose.connection.collection("users").updateOne(
  { email: adminEmail },
  { $set: { role: "admin", updatedAt: new Date() } },
);
await mongoose.disconnect();

if (!result.matchedCount) throw new Error(`No user account exists for ${adminEmail}. Register this email first.`);
console.log(`Promoted ${adminEmail} to administrator.`);

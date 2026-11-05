import fs from "node:fs";
import mongoose from "mongoose";

const env = fs.readFileSync(".env.local", "utf8");
const uri = env.match(/^MONGODB_URI=(.+)$/m)?.[1]?.trim();
if (!uri) throw new Error("MONGODB_URI is missing from .env.local");

await mongoose.connect(uri);
await mongoose.connection.collection("sitesettings").updateOne(
  { key: "singleton" },
  {
    $set: {
      email: "bbhupender100@gmail.com",
      phone: "+91 9311278407",
      address: "Vijay Nagar Bypass, Bagu",
      updatedAt: new Date(),
    },
    $setOnInsert: { key: "singleton", instituteName: "Elite Coding School" },
  },
  { upsert: true },
);
await mongoose.disconnect();

console.log("Updated the public site contact details.");

import fs from "node:fs";
import mongoose from "mongoose";

const env = fs.readFileSync(".env.local", "utf8");
const uri = env.match(/^MONGODB_URI=(.+)$/m)?.[1]?.trim();
if (!uri) throw new Error("MONGODB_URI is missing from .env.local");

await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000 });
try {
  const users = mongoose.connection.collection("users");
  // Old local-password accounts stored null. Remove only that legacy optional value.
  const cleanup = await users.updateMany({ googleSubject: null }, { $unset: { googleSubject: "" } });
  const oldIndex = (await users.indexes()).find((index) => index.name === "googleSubject_1");
  if (oldIndex && (!oldIndex.unique || !oldIndex.sparse)) await users.dropIndex("googleSubject_1");
  const currentIndex = (await users.indexes()).find((index) => index.name === "googleSubject_1");
  if (!currentIndex)
    await users.createIndex({ googleSubject: 1 }, { name: "googleSubject_1", unique: true, sparse: true });
  console.log(`Removed legacy null Google subjects from ${cleanup.modifiedCount} user record(s).`);
  console.log("Verified sparse unique googleSubject index.");
} finally {
  await mongoose.disconnect();
}

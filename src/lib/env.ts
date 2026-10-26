export type RequiredEnv = "MONGODB_URI";
export function getEnv(key: RequiredEnv) {
  const value = process.env[key]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

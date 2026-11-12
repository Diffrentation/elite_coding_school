/**
 * Resolve the public URL used in durable artefacts such as certificates and
 * QR codes.  A request made to localhost must never make a printed QR code
 * point back to localhost, because a student's phone cannot reach it.
 */
export function publicUrl(path: string, request?: Request) {
  const configured =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);
  const base = configured?.trim() || request?.url;

  if (!base) throw new Error("A public application URL is required to create a verification link.");
  return new URL(path, base).toString();
}

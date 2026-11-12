import QRCode from "qrcode";
import { Certificate } from "@/models/Certificate";
import { connectDb } from "@/lib/db";
import { publicUrl } from "@/lib/public-url";
import { enforceRateLimit } from "@/lib/security";

/**
 * A small public QR asset for the visual certificate preview. The encoded URL
 * is derived from the incoming request rather than client input, so the QR is
 * always bound to the real, canonical verification page.
 */
export async function GET(request: Request, { params }: { params: Promise<{ certificateId: string }> }) {
  const limited = enforceRateLimit(request, { name: "certificate-qr", limit: 60, windowMs: 60_000 });
  if (limited) return limited;

  await connectDb();
  const { certificateId } = await params;
  const certificate = await Certificate.findOne({
    certificateId: certificateId.toUpperCase(),
    status: "active",
  })
    .select("certificateId verificationPath")
    .lean();

  if (!certificate) return new Response("Certificate not found", { status: 404 });

  const verificationUrl = publicUrl(certificate.verificationPath, request);
  const svg = await QRCode.toString(verificationUrl, {
    type: "svg",
    errorCorrectionLevel: "H",
    margin: 1,
    width: 512,
    color: { dark: "#101c36", light: "#ffffff" },
  });

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

import nodemailer from "nodemailer";
export async function sendOtpEmail(to: string, code: string, purpose: "verify" | "reset") {
  const host = process.env.SMTP_HOST;
  const user = process.env.EMAIL_USER;
  if (!host || !user || !process.env.EMAIL_PASS) throw new Error("Email delivery is not configured");
  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user, pass: process.env.EMAIL_PASS },
  });
  await transporter.sendMail({
    from: process.env.SENDER_EMAIL || user,
    to,
    subject:
      purpose === "verify"
        ? "Verify your Elite Coding School account"
        : "Reset your Elite Coding School password",
    text: `Your Elite Coding School verification code is ${code}. It expires in 10 minutes.`,
  });
}

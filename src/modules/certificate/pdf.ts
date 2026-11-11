import PDFDocument from "pdfkit";
import QRCode from "qrcode";

export type CertificatePdfInput = {
  certificateId: string;
  studentName: string;
  courseName: string;
  issueDate: Date;
  verificationUrl: string;
  templateUrl: string;
};

const fitFontSize = (document: PDFKit.PDFDocument, text: string, maxWidth: number, start: number, min: number) => {
  for (let size = start; size >= min; size -= 1) {
    document.fontSize(size);
    if (document.widthOfString(text) <= maxWidth) return size;
  }
  return min;
};

export async function certificatePdf(input: CertificatePdfInput) {
  const document = new PDFDocument({ size: "A4", layout: "landscape", margin: 0, autoFirstPage: true });
  const chunks: Buffer[] = [];
  document.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
  const completed = new Promise<Buffer>((resolve, reject) => {
    document.on("end", () => resolve(Buffer.concat(chunks)));
    document.on("error", reject);
  });

  const width = document.page.width;
  const height = document.page.height;
  const templateResponse = await fetch(input.templateUrl);
  if (!templateResponse.ok) throw new Error("CERTIFICATE_TEMPLATE_UNAVAILABLE");
  const template = Buffer.from(await templateResponse.arrayBuffer());
  document.image(template, 0, 0, { width, height });

  document.fillColor("#101c36").font("Helvetica-Bold");
  fitFontSize(document, input.studentName, width * 0.66, 43, 24);
  document.text(input.studentName, width * 0.17, height * 0.355, { width: width * 0.66, align: "center", lineBreak: false });
  document.fillColor("#13284b").font("Helvetica-Bold");
  fitFontSize(document, input.courseName, width * 0.72, 25, 15);
  document.text(input.courseName, width * 0.14, height * 0.52, { width: width * 0.72, align: "center", lineBreak: false });
  document.font("Helvetica").fontSize(10).fillColor("#18243d");
  document.text(`Certificate ID  ${input.certificateId}`, width * 0.15, height * 0.85, { width: width * 0.23, align: "center" });
  document.text(`Issued ${input.issueDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`, width * 0.76, height * 0.85, { width: width * 0.15, align: "center" });

  const qr = await QRCode.toBuffer(input.verificationUrl, { errorCorrectionLevel: "H", margin: 1, width: 900 });
  document.image(qr, width * 0.048, height * 0.79, { width: width * 0.08, height: width * 0.08 });
  document.end();
  return completed;
}

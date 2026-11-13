import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import { readFile } from "node:fs/promises";
import path from "node:path";

export type CertificatePdfInput = {
  certificateId: string;
  studentName: string;
  courseName: string;
  issueDate: Date;
  verificationUrl: string;
  templateUrl: string;
};

const fitFontSize = (
  document: PDFKit.PDFDocument,
  text: string,
  maxWidth: number,
  start: number,
  min: number,
) => {
  for (let size = start; size >= min; size -= 1) {
    document.fontSize(size);
    if (document.widthOfString(text) <= maxWidth) return size;
  }
  return min;
};

async function loadTemplate(templateUrl: string) {
  if (templateUrl.startsWith("/")) {
    const fileName = templateUrl.replace(/^\/+/, "");
    if (fileName.includes("..")) throw new Error("CERTIFICATE_TEMPLATE_UNAVAILABLE");
    return readFile(path.join(process.cwd(), "public", fileName));
  }

  const response = await fetch(templateUrl);
  if (!response.ok) throw new Error("CERTIFICATE_TEMPLATE_UNAVAILABLE");
  return Buffer.from(await response.arrayBuffer());
}

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
  const template = await loadTemplate(input.templateUrl);
  document.image(template, 0, 0, { width, height });
  const courseName = input.courseName.trim().replace(/\s+/g, " ");

  // Replace top-right raster motto with print-sharp vector text and dividers
  document.save();
  document.fillColor("#ffffff").rect(546, 20.5, 272, 19.5).fill();
  document.restore();
  document
    .font("Helvetica-Bold")
    .fontSize(11.5)
    .fillColor("#101c36")
    .text("Learn      |      Build      |      Practice      |      Grow", 546, 24.5, {
      width: 272,
      align: "center",
      lineBreak: false,
    });

  // Replace the raster certificate lead-in with print-sharp vector text while
  // retaining the original gold rules on each side.
  document.save();
  document.fillColor("#ffffff").rect(340, 181, 166, 25).fill();
  document.restore();
  document
    .font("Helvetica-Bold")
    .fontSize(15)
    .fillColor("#18243d")
    .text("This is to certify that", 340, 185, {
      width: 166,
      align: "center",
      lineBreak: false,
    });

  // Source document coordinates were measured against the original A4 artwork.
  // The artwork has a blank name band and fixed certificate ID, QR and date fields.
  // Match the hierarchy of the official certificate artwork: an elegant
  // recipient name, a strong program title, then restrained supporting copy.
  document.fillColor("#101c36").font("Times-BoldItalic");
  fitFontSize(document, input.studentName, 352, 46, 27);
  document.text(input.studentName, 249, 223, { width: 352, align: "center", lineBreak: false });

  // Course names vary per certificate. The official artwork intentionally leaves
  // this band open, so replace its placeholder wording as one complete block.
  // An opaque cover is essential here: partial transparency makes template text
  // show through the generated title and looks like an invalid certificate.
  // Centered soft-radius cover that stays safely inside the clear central zone
  // without clipping into the decorative guilloche watermark lines on the margins
  document.save();
  document.fillColor("#ffffff").roundedRect(172, 272, 498, 110, 20).fill();
  document.restore();
  // Restore the lower gold divider after clearing the dynamic content area.
  document.save();
  document.strokeColor("#d5a11e").lineWidth(0.8).moveTo(238, 273).lineTo(604, 273).stroke();
  document.restore();

  document
    .font("Helvetica-Bold")
    .fontSize(15)
    .fillColor("#18243d")
    .text("has successfully completed the", 151, 282, { width: 540, align: "center", lineBreak: false });
  document.font("Helvetica-Bold").fillColor("#13284b");
  fitFontSize(document, courseName, 540, 25, 16);
  document.text(courseName, 151, 305, { width: 540, align: "center", lineBreak: false });

  document
    .font("Helvetica")
    .fontSize(13.5)
    .fillColor("#18243d")
    .text("at The Elite Coding School, demonstrating practical skills in", 171, 342, {
      width: 500,
      align: "center",
      lineBreak: false,
    });
  const achievementLine = `building real-world projects in ${courseName}.`;
  document.font("Helvetica");
  fitFontSize(document, achievementLine, 500, 13.5, 10);
  if (document.widthOfString(achievementLine) <= 500) {
    document.text(achievementLine, 171, 360, { width: 500, align: "center", lineBreak: false });
  } else {
    // Very long program titles stay readable by moving the course reference to
    // its own centred line instead of spilling outside the artwork.
    document.fontSize(12).text("building real-world projects in", 171, 360, {
      width: 500,
      align: "center",
      lineBreak: false,
    });
    document.font("Helvetica-Bold");
    fitFontSize(document, courseName, 500, 12, 10);
    document.text(courseName, 171, 375, { width: 500, align: "center", lineBreak: false });
  }

  // The source artwork's footer labels are raster. Replace the two variable
  // metadata blocks with crisp vector labels and values for print-quality output.
  document.save();
  document.fillColor("#ffffff").rect(126, 494, 146, 45).fill();

  // Premium styled background pills with subtle ice-pearl fill and refined borders
  document.fillColor("#f4f7fb").roundedRect(142, 514, 126, 24, 6).fill();
  document.fillColor("#f4f7fb").roundedRect(734, 513, 85, 24, 6).fill();

  // Polished crisp border with subtle high-contrast outline
  document.strokeColor("#b6c5d9").lineWidth(0.85).roundedRect(142, 514, 126, 24, 6).stroke();
  document.roundedRect(734, 513, 85, 24, 6).stroke();
  document.restore();

  // Both metadata groups are rendered as print-sharp vector elements.
  document.save();
  document.strokeColor("#18243d").lineWidth(0.7).moveTo(130, 498).lineTo(130, 533).stroke();
  document.moveTo(682, 500).lineTo(682, 532).stroke();
  document.restore();

  // Header Labels
  document.font("Helvetica-Bold").fontSize(9.5).fillColor("#18243d").text("Certificate ID", 144, 499, {
    width: 122,
    align: "left",
    lineBreak: false,
  });

  document.save();
  document.strokeColor("#18243d").lineWidth(1.25).roundedRect(697, 511, 17, 16, 2).stroke();
  document.moveTo(697, 516).lineTo(714, 516).stroke();
  document.moveTo(701, 508).lineTo(701, 514).stroke();
  document.moveTo(710, 508).lineTo(710, 514).stroke();
  document.restore();

  document.font("Helvetica-Bold").fontSize(9.5).fillColor("#18243d").text("Issued On", 736, 499, {
    width: 82,
    align: "left",
    lineBreak: false,
  });

  // Pill Content Typography (Enhanced font sizes and crisp optical centering)
  document.font("Helvetica-Bold").fontSize(10.5).fillColor("#0e244d");
  document.text(input.certificateId, 144, 520.5, { width: 122, align: "center", lineBreak: false });

  // The dynamic date is confidently sized and centered in the date pill
  document.font("Helvetica-Bold").fontSize(9.2).fillColor("#0e244d");
  document.text(
    input.issueDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    736,
    520.5,
    { width: 81, align: "center", lineBreak: false },
  );

  // A compact verification stamp sits below the official seal. It is drawn as
  // vector artwork with luxury navy & gold foil styling to match the institutional seal.
  // Perfectly balanced across the medal ribbon tails.
  const stampX = 306;
  const stampY = 545;
  const stampWidth = 196;
  const stampHeight = 22;
  document.save();

  // Solid deep royal navy pill matching the medal ribbon color to prevent background clash
  document.fillColor("#0a1733").roundedRect(stampX, stampY, stampWidth, stampHeight, 11).fill();

  // Outer polished metallic gold border
  document
    .strokeColor("#c59b27")
    .lineWidth(1.2)
    .roundedRect(stampX, stampY, stampWidth, stampHeight, 11)
    .stroke();

  // Inner refined gold hairline accent
  document
    .strokeColor("#eecb6d")
    .lineWidth(0.55)
    .roundedRect(stampX + 2, stampY + 2, stampWidth - 4, stampHeight - 4, 9)
    .stroke();

  // Elegant gold 5-point star emblems
  const drawStar = (centerX: number, centerY: number) => {
    const outer = 4.2;
    const inner = 1.9;
    for (let index = 0; index < 10; index += 1) {
      const radius = index % 2 === 0 ? outer : inner;
      const angle = -Math.PI / 2 + (index * Math.PI) / 5;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      if (index === 0) document.moveTo(x, y);
      else document.lineTo(x, y);
    }
    document.closePath().fill();
  };
  document.fillColor("#f3d078");
  drawStar(stampX + 15, stampY + stampHeight / 2);
  drawStar(stampX + stampWidth - 15, stampY + stampHeight / 2);
  document.restore();

  // Crisp executive typography in warm lustrous gold
  document
    .font("Helvetica-Bold")
    .fontSize(7.2)
    .fillColor("#f7e19e")
    .text("OFFICIAL VERIFIED CREDENTIAL", stampX + 20, stampY + 7, {
      width: stampWidth - 40,
      align: "center",
      lineBreak: false,
    });

  // Crisp vector arrow brackets `< >` inside the institutional seal letter 'C'
  document.save();
  document.strokeColor("#ffffff").lineWidth(0.85).lineCap("round").lineJoin("round");
  document.moveTo(406.3, 495.1).lineTo(404.0, 497.6).lineTo(406.3, 500.1).stroke();
  document.moveTo(408.0, 495.1).lineTo(410.3, 497.6).lineTo(408.0, 500.1).stroke();
  document.restore();

  // The official authentic handwritten signature of Founder Bhupendra Singh
  // Placed right above the signature line and founder attribution text
  try {
    const signaturePath = path.join(process.cwd(), "public", "certificates", "bhupendra-singh-signature.png");
    const signatureBuffer = await readFile(signaturePath);
    document.image(signatureBuffer, 518.5, 472, { width: 130, height: 44 });
  } catch {
    // Graceful fallback if signature asset is absent
  }

  // The attribution beneath the signature line is official, fixed certificate text in crisp black/deep navy.
  document
    .font("Helvetica-Bold")
    .fontSize(12)
    .fillColor("#101c36")
    .text("Bhupendra Singh", 511, 524, { width: 145, align: "center", lineBreak: false });
  document
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#18243d")
    .text("Founder & Instructor", 511, 540, { width: 145, align: "center", lineBreak: false });
  document
    .fillColor("#18243d")
    .text("The Elite Coding School", 511, 553, { width: 145, align: "center", lineBreak: false });

  const qr = await QRCode.toBuffer(input.verificationUrl, {
    errorCorrectionLevel: "H",
    margin: 1,
    width: 900,
  });
  document.image(qr, 39, 478, { width: 73, height: 73 });
  document.end();
  return completed;
}

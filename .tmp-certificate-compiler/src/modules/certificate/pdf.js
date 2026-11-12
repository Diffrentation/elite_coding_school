"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.certificatePdf = certificatePdf;
const pdfkit_1 = __importDefault(require("pdfkit"));
const qrcode_1 = __importDefault(require("qrcode"));
const promises_1 = require("node:fs/promises");
const node_path_1 = __importDefault(require("node:path"));
const fitFontSize = (document, text, maxWidth, start, min) => {
    for (let size = start; size >= min; size -= 1) {
        document.fontSize(size);
        if (document.widthOfString(text) <= maxWidth)
            return size;
    }
    return min;
};
async function loadTemplate(templateUrl) {
    if (templateUrl.startsWith("/")) {
        const fileName = templateUrl.replace(/^\/+/, "");
        if (fileName.includes(".."))
            throw new Error("CERTIFICATE_TEMPLATE_UNAVAILABLE");
        return (0, promises_1.readFile)(node_path_1.default.join(process.cwd(), "public", fileName));
    }
    const response = await fetch(templateUrl);
    if (!response.ok)
        throw new Error("CERTIFICATE_TEMPLATE_UNAVAILABLE");
    return Buffer.from(await response.arrayBuffer());
}
async function certificatePdf(input) {
    const document = new pdfkit_1.default({ size: "A4", layout: "landscape", margin: 0, autoFirstPage: true });
    const chunks = [];
    document.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    const completed = new Promise((resolve, reject) => {
        document.on("end", () => resolve(Buffer.concat(chunks)));
        document.on("error", reject);
    });
    const width = document.page.width;
    const height = document.page.height;
    const template = await loadTemplate(input.templateUrl);
    document.image(template, 0, 0, { width, height });
    const courseName = input.courseName.trim().replace(/\s+/g, " ");
    // Replace the raster certificate lead-in with print-sharp vector text while
    // retaining the original gold rules on each side.
    document.save();
    document.fillColor("#ffffff").rect(340, 181, 166, 25).fill();
    document.restore();
    document.font("Helvetica-Bold").fontSize(15).fillColor("#18243d").text("This is to certify that", 340, 185, {
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
    document.save();
    document.fillColor("#ffffff").rect(128, 270, 582, 112).fill();
    document.restore();
    // Restore the lower gold divider after clearing the dynamic content area.
    document.save();
    document.strokeColor("#d5a11e").lineWidth(0.8).moveTo(238, 273).lineTo(604, 273).stroke();
    document.restore();
    document.font("Times-Bold").fontSize(17).fillColor("#18243d").text("has successfully completed the", 151, 282, { width: 540, align: "center", lineBreak: false });
    document.font("Helvetica-Bold").fillColor("#13284b");
    fitFontSize(document, courseName, 540, 25, 16);
    document.text(courseName, 151, 305, { width: 540, align: "center", lineBreak: false });
    document.font("Times-Roman").fontSize(15).fillColor("#18243d").text("at The Elite Coding School, demonstrating practical skills in", 171, 342, { width: 500, align: "center", lineBreak: false });
    const achievementLine = `building real-world projects in ${courseName}.`;
    document.font("Times-Roman");
    fitFontSize(document, achievementLine, 500, 15, 10);
    if (document.widthOfString(achievementLine) <= 500) {
        document.text(achievementLine, 171, 360, { width: 500, align: "center", lineBreak: false });
    }
    else {
        // Very long program titles stay readable by moving the course reference to
        // its own centred line instead of spilling outside the artwork.
        document.fontSize(13).text("building real-world projects in", 171, 360, {
            width: 500,
            align: "center",
            lineBreak: false,
        });
        document.font("Times-Bold");
        fitFontSize(document, courseName, 500, 13, 10);
        document.text(courseName, 171, 375, { width: 500, align: "center", lineBreak: false });
    }
    // The source artwork's footer labels are raster. Replace the two variable
    // metadata blocks with crisp vector labels and values for print-quality output.
    document.save();
    document.fillColor("#ffffff").rect(126, 494, 146, 45).fill();
    document.fillColor("#eef1f5").roundedRect(144, 515, 122, 22, 4).fill();
    // The rebuilt date component is placed over a clean template area.
    document.fillColor("#eef1f5").roundedRect(737, 514, 79, 23, 4).fill();
    document.strokeColor("#d7dde7").lineWidth(0.45).roundedRect(144, 515, 122, 22, 4).stroke();
    document.roundedRect(737, 514, 79, 23, 4).stroke();
    document.restore();
    // Both metadata groups are rendered as print-sharp vector elements.
    document.save();
    document.strokeColor("#18243d").lineWidth(0.7).moveTo(130, 498).lineTo(130, 533).stroke();
    document.moveTo(682, 500).lineTo(682, 532).stroke();
    document.restore();
    document.font("Helvetica-Bold").fontSize(9.6).fillColor("#18243d").text("Certificate ID", 144, 500, {
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
    document.font("Helvetica-Bold").fontSize(8.4).fillColor("#18243d").text("Issued On", 737, 503, {
        width: 79,
        align: "left",
        lineBreak: false,
    });
    document.font("Helvetica-Bold").fontSize(9.4).fillColor("#18243d");
    document.text(input.certificateId, 149, 521, { width: 112, align: "center", lineBreak: false });
    // The dynamic date is centred in the rebuilt grey pill.
    document.font("Helvetica-Bold").fontSize(7.7).text(input.issueDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }), 739, 521, { width: 75, align: "center", lineBreak: false });
    // Keep the signature rule intentionally blank for a real handwritten signature.
    // The attribution beneath it is official, fixed certificate text.
    document.font("Helvetica-Bold").fontSize(12).text("Bhupendra Singh", 511, 524, { width: 145, align: "center", lineBreak: false });
    document.font("Helvetica").fontSize(10).text("Founder & Instructor", 511, 540, { width: 145, align: "center", lineBreak: false });
    document.text("The Elite Coding School", 511, 553, { width: 145, align: "center", lineBreak: false });
    const qr = await qrcode_1.default.toBuffer(input.verificationUrl, { errorCorrectionLevel: "H", margin: 1, width: 900 });
    document.image(qr, 39, 478, { width: 73, height: 73 });
    document.end();
    return completed;
}

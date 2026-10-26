import PDFDocument from "pdfkit";

export function receiptPdf(receipt: {
  receiptNumber: string;
  amount: number;
  method: string;
  paidAt: Date;
  studentName: string;
  studentId: string;
  course: string;
}) {
  return new Promise<Buffer>((resolve, reject) => {
    const document = new PDFDocument({ size: "A4", margin: 54 });
    const chunks: Buffer[] = [];
    document.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    document.on("end", () => resolve(Buffer.concat(chunks)));
    document.on("error", reject);
    document.fillColor("#5b21b6").fontSize(24).text("Elite Coding School");
    document.fillColor("#111827").fontSize(16).text("Fee Payment Receipt", { align: "right" });
    document.moveDown();
    document
      .fontSize(11)
      .fillColor("#4b5563")
      .text(`Receipt number: ${receipt.receiptNumber}`)
      .text(`Payment date: ${receipt.paidAt.toLocaleDateString("en-IN")}`)
      .moveDown();
    document
      .fillColor("#111827")
      .fontSize(12)
      .text(`Student: ${receipt.studentName}`)
      .text(`Student ID: ${receipt.studentId}`)
      .text(`Course: ${receipt.course}`)
      .moveDown();
    document.rect(54, document.y, 487, 58).fill("#f3f0ff");
    document
      .fillColor("#111827")
      .fontSize(11)
      .text("Amount received", 70, document.y + 15)
      .fontSize(20)
      .text(`₹${receipt.amount.toLocaleString("en-IN")}`, 70, document.y + 29)
      .fontSize(11)
      .text(`Method: ${receipt.method.toUpperCase()}`, 360, document.y - 29);
    document.moveDown(5);
    document
      .fillColor("#6b7280")
      .fontSize(9)
      .text("This receipt confirms an offline payment recorded by Elite Coding School.", { align: "center" });
    document.end();
  });
}

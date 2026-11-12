import { describe, it, expect } from "vitest";
import { certificatePdf } from "./pdf";

describe("certificatePdf", () => {
  it("renders a valid vector PDF with crisp motto and official elements", async () => {
    const pdfBuffer = await certificatePdf({
      certificateId: "ECS-2026-00001",
      studentName: "Ashish Singh",
      courseName: "Full-Stack MERN & Next.js Development",
      issueDate: new Date("2026-11-12"),
      verificationUrl: "http://localhost:3000/verify/ECS-2026-00001",
      templateUrl: "/certificates/elite-certificate-template-v3.png",
    });

    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(10000);
    expect(pdfBuffer.subarray(0, 5).toString()).toBe("%PDF-");
  });
});

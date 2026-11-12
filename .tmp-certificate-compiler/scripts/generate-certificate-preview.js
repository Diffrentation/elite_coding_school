"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = require("node:fs/promises");
const node_path_1 = __importDefault(require("node:path"));
const pdf_1 = require("../src/modules/certificate/pdf");
void (0, pdf_1.certificatePdf)({
    certificateId: "ECS-2026-00001",
    studentName: "Ashish Singh",
    courseName: "Full-Stack MERN & Next.js Development",
    issueDate: new Date("2026-11-10T00:00:00.000Z"),
    verificationUrl: "https://elite-coding-school-beryl.vercel.app/verify/preview",
    templateUrl: "/certificates/elite-certificate-template-v3.png",
}).then((pdf) => (0, promises_1.writeFile)(node_path_1.default.join(process.cwd(), ".tmp-certificate-preview.pdf"), pdf));

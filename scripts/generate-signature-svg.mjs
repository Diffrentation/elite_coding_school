import fs from "node:fs";
import { PNG } from "pngjs";

const imgBuf = fs.readFileSync("public/certificates/bhupendra-singh-signature.png");
const img = PNG.sync.read(imgBuf);
const w = img.width;
const h = img.height;

// Convert ink pixels to clean SVG vector paths
let pathData = "";
for (let y = 0; y < h; y++) {
  let inSpan = false;
  let startX = 0;
  for (let x = 0; x < w; x++) {
    const a = img.data[(w * y + x) * 4 + 3];
    if (a > 60) {
      if (!inSpan) {
        inSpan = true;
        startX = x;
      }
    } else {
      if (inSpan) {
        inSpan = false;
        pathData += `M${startX},${y}H${x}V${y + 1}H${startX}Z `;
      }
    }
  }
  if (inSpan) {
    pathData += `M${startX},${y}H${w}V${y + 1}H${startX}Z `;
  }
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <path d="${pathData.trim()}" fill="#0d2249" shape-rendering="geometricPrecision" />
</svg>`;

fs.writeFileSync("public/certificates/bhupendra-singh-signature.svg", svg);
console.log("Saved vector SVG file (bytes: " + svg.length + ")");

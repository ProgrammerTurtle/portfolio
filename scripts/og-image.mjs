// Builds public/og.png, the 1200x630 social preview: the hero's four bands and the
// name set in Neometric (converted to outlines, so no font setup is needed).
//
// Run: node scripts/og-image.mjs

import { readFileSync } from 'node:fs';
import opentype from 'opentype.js';
import sharp from 'sharp';

const src = readFileSync(new URL('../public/fonts/Neometric-Medium.otf', import.meta.url));
const font = opentype.parse(src.buffer.slice(src.byteOffset, src.byteOffset + src.byteLength));

const W = 1200, H = 630, w = 30, R0 = 230, edgeB = 64, edgeR = 64;
const colors = ['#6e2a17', '#cf3a20', '#ea6d23', '#f2a900'];

// Same geometry as the hero: bands run in from the left, then bend up the right side.
const bands = colors.map((c, k) => {
  const off = w / 2 + k * w;
  const x = W - edgeR - off, y = H - edgeB - off, r = R0 - k * w - w / 2;
  return `<path d="M0 ${y}H${x - r}A${r} ${r} 0 0 0 ${x} ${y - r}V0" stroke="${c}" stroke-width="${w}" fill="none"/>`;
}).join('');

const line = (text, x, y, size, tracking = 0) => font.getPath(text, x, y, size, { letterSpacing: tracking }).toPathData(2);
const size = 180, base = 44 + size * 0.72;
const name = line('Parker', 64, base, size, -0.035) + line('Rupe', 64, base + size * 0.86, size, -0.035);
const url = line('parkerrupe.xyz', 70, base + size * 0.86 + 72, 34);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="100%" height="100%" fill="#ebe7df"/>${bands}
  <path d="${name}" fill="#151311"/><path d="${url}" fill="#5f5a53"/>
</svg>`;

const out = new URL('../public/og.png', import.meta.url);
await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(out.pathname);
console.log(`wrote ${out.pathname}`);

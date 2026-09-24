// Builds public/fonts/Neometric-Extras.otf: the characters Neometric doesn't ship
// (é, @, hyphens, quotes, slash, and so on), drawn on Neometric's own geometry.
// global.css loads it under the same family name with a unicode-range, so the
// browser only uses it for these characters.
//
// Derived from Neometric by Andres Sanchez (CC BY-NC-SA 3.0). The accented
// letters and @ reuse Neometric's own a, e, and E outlines.
//
// Run: node scripts/neometric-extras.mjs

import { readFileSync, writeFileSync } from 'node:fs';
import opentype from 'opentype.js';

const src = readFileSync(new URL('../public/fonts/Neometric-Medium.otf', import.meta.url));
const base = opentype.parse(src.buffer.slice(src.byteOffset, src.byteOffset + src.byteLength));

// Neometric's measurements, read off the source glyphs.
const S = 78;          // stroke (stem of "l")
const SB = 30;         // side bearing
const XH = 412;        // x-height
const CAP = 618;       // cap height
const MID = XH / 2;    // math axis: middle of the x-height

// ---- path helpers --------------------------------------------------------

const area = (pts) => pts.reduce((a, [x, y], i) => {
  const [nx, ny] = pts[(i + 1) % pts.length];
  return a + (x * ny - nx * y);
}, 0) / 2;

// CFF outer contours run counterclockwise.
function poly(path, pts) {
  const p = area(pts) < 0 ? [...pts].reverse() : pts;
  path.moveTo(...p[0]);
  for (const pt of p.slice(1)) path.lineTo(...pt);
  path.close();
}

const rect = (path, x1, y1, x2, y2) => poly(path, [[x1, y1], [x2, y1], [x2, y2], [x1, y2]]);

// Arc from angle a0 to a1 (radians) as cubic segments, appended to an open contour.
function arc(path, cx, cy, r, a0, a1, move) {
  const n = Math.ceil(Math.abs(a1 - a0) / (Math.PI / 2));
  const d = (a1 - a0) / n;
  const k = (4 / 3) * Math.tan(d / 4);
  const pt = (a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  if (move) path.moveTo(...pt(a0)); else path.lineTo(...pt(a0));
  for (let i = 0; i < n; i++) {
    const s = a0 + i * d, e = s + d;
    const [sx, sy] = pt(s), [ex, ey] = pt(e);
    path.curveTo(
      sx - k * r * Math.sin(s), sy + k * r * Math.cos(s),
      ex + k * r * Math.sin(e), ey - k * r * Math.cos(e),
      ex, ey,
    );
  }
}

// Ring segment between radii r and R from a0 to a1 (counterclockwise).
function band(path, cx, cy, R, r, a0, a1) {
  arc(path, cx, cy, R, a0, a1, true);
  arc(path, cx, cy, r, a1, a0, false);
  path.close();
}

function ring(path, cx, cy, R, r) {
  arc(path, cx, cy, R, 0, 2 * Math.PI, true);
  path.close();
  arc(path, cx, cy, r, 2 * Math.PI, 0, true); // clockwise: the hole
  path.close();
}

// Copy another glyph's outline, scaled and moved.
function copy(path, ch, s = 1, dx = 0, dy = 0) {
  for (const c of base.charToGlyph(ch).path.commands) {
    const t = (x, y) => [x * s + dx, y * s + dy];
    if (c.type === 'M') path.moveTo(...t(c.x, c.y));
    else if (c.type === 'L') path.lineTo(...t(c.x, c.y));
    else if (c.type === 'C') path.curveTo(...t(c.x1, c.y1), ...t(c.x2, c.y2), ...t(c.x, c.y));
    else if (c.type === 'Q') path.quadraticCurveTo(...t(c.x1, c.y1), ...t(c.x, c.y));
    else if (c.type === 'Z') path.close();
  }
}

// Copy only some contours of another glyph (e.g. one stroke of a double quote).
function copyContours(path, ch, keep, dx = 0) {
  let i = 0;
  for (const c of base.charToGlyph(ch).path.commands) {
    if (keep.includes(i)) {
      if (c.type === 'M') path.moveTo(c.x + dx, c.y);
      else if (c.type === 'L') path.lineTo(c.x + dx, c.y);
      else if (c.type === 'C') path.curveTo(c.x1 + dx, c.y1, c.x2 + dx, c.y2, c.x + dx, c.y);
      else if (c.type === 'Z') path.close();
    }
    if (c.type === 'Z') i++;
  }
}

// Intersection of line p1-p2 with line p3-p4.
function meet([x1, y1], [x2, y2], [x3, y3], [x4, y4]) {
  const d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  const a = x1 * y2 - y1 * x2, b = x3 * y4 - y3 * x4;
  return [(a * (x3 - x4) - (x1 - x2) * b) / d, (a * (y3 - y4) - (y1 - y2) * b) / d];
}

// Two strokes joined at a mitered point: used for < and >.
function chevron(tip, end1, end2) {
  const off = ([ax, ay], [bx, by], side) => {
    const len = Math.hypot(bx - ax, by - ay);
    const nx = (-(by - ay) / len) * (S / 2) * side, ny = ((bx - ax) / len) * (S / 2) * side;
    return [[ax + nx, ay + ny], [bx + nx, by + ny]];
  };
  const [a1o, b1o] = off(tip, end1, 1), [a1i, b1i] = off(tip, end1, -1);
  const [a2o, b2o] = off(tip, end2, -1), [a2i, b2i] = off(tip, end2, 1);
  return [b1o, meet(a1o, b1o, a2o, b2o), b2o, b2i, meet(a1i, b1i, a2i, b2i), b1i];
}

const rotate = (pts, deg, [cx, cy], s = 1) => {
  const r = (deg * Math.PI) / 180;
  return pts.map(([x, y]) => {
    const dx = (x - cx) * s, dy = (y - cy) * s;
    return [cx + dx * Math.cos(r) - dy * Math.sin(r), cy + dx * Math.sin(r) + dy * Math.cos(r)];
  });
};

const plusPts = (cx, cy, arm, t) => {
  const h = t / 2;
  return [
    [cx - h, cy - arm], [cx + h, cy - arm], [cx + h, cy - h], [cx + arm, cy - h],
    [cx + arm, cy + h], [cx + h, cy + h], [cx + h, cy + arm], [cx - h, cy + arm],
    [cx - h, cy + h], [cx - arm, cy + h], [cx - arm, cy - h], [cx - h, cy - h],
  ];
};

// Acute accent: a short stroke leaning right, sitting above the letter.
const acute = (path, cx, y) => poly(path, [[cx - 66, y], [cx + 12, y], [cx + 102, y + 118], [cx + 24, y + 118]]);

// ---- glyphs --------------------------------------------------------------

const glyphs = [new opentype.Glyph({ name: '.notdef', unicode: undefined, advanceWidth: 500, path: new opentype.Path() })];
function add(name, unicodes, advanceWidth, draw) {
  const path = new opentype.Path();
  draw(path);
  // One glyph per code point (opentype.js only maps a glyph's first unicode),
  // skipping anything Neometric already draws.
  unicodes
    .filter((u) => !base.charToGlyph(String.fromCodePoint(u)).index)
    .forEach((u, i) => glyphs.push(new opentype.Glyph({ name: i ? `${name}.${i}` : name, unicode: u, advanceWidth, path })));
}

const quoteTop = CAP, quoteH = 180;
// Straight marks for ' and ", slanted ones built from Neometric's own curly quotes.
add('quotesingle', [0x27], 138, (p) => rect(p, SB, quoteTop - quoteH, SB + S, quoteTop));
add('quotedbl', [0x22], 266, (p) => {
  rect(p, SB, quoteTop - quoteH, SB + S, quoteTop);
  rect(p, SB + 128, quoteTop - quoteH, SB + 128 + S, quoteTop);
});
// Each curly quote in Neometric is two wedge contours; the left wedge spans x 30-183.
add('quoteright', [0x2019, 0x2032, 0x2bc], 213, (p) => copyContours(p, '\u201d', [0]));
add('quoteleft', [0x2018], 213, (p) => copyContours(p, '\u201c', [1]));
add('second', [0x2033], base.charToGlyph('\u201d').advanceWidth, (p) => copyContours(p, '\u201d', [0, 1]));
add('hyphen', [0x2d, 0x2010, 0x2011], 290, (p) => rect(p, SB, MID - S / 2, 260, MID + S / 2));
add('endash', [0x2013], 472, (p) => rect(p, SB, MID - S / 2, 442, MID + S / 2));
add('emdash', [0x2014], 1000, (p) => rect(p, SB, MID - S / 2, 970, MID + S / 2));
add('underscore', [0x5f], 472, (p) => rect(p, SB, -120, 442, -120 + S));
add('slash', [0x2f], 342, (p) => poly(p, [[SB, 0], [SB + 82, 0], [312, CAP], [230, CAP]]));
add('periodcentered', [0xb7], 137, (p) => rect(p, SB, MID - 38, SB + 77, MID + 38));
add('ellipsis', [0x2026], 411, (p) => { for (const x of [SB, 167, 304]) rect(p, x, 0, x + 77, 76); });
add('plus', [0x2b], 472, (p) => poly(p, plusPts(236, MID, 206, S)));
add('multiply', [0xd7], 472, (p) => poly(p, rotate(plusPts(236, MID, 206, S), 45, [236, MID], 0.82)));
add('less', [0x3c], 472, (p) => poly(p, chevron([72, MID], [442, XH - 10], [442, 10])));
add('greater', [0x3e], 472, (p) => poly(p, chevron([72, MID], [442, XH - 10], [442, 10]).map(([x, y]) => [472 - x, y])));
add('degree', [0xb0], 280, (p) => ring(p, 140, CAP - 110, 110, 110 - 64));
add('eacute', [0xe9], 472, (p) => { copy(p, 'e'); acute(p, 236, XH + 58); });
add('aacute', [0xe1], 472, (p) => { copy(p, 'a'); acute(p, 236, XH + 58); });
add('Eacute', [0xc9], 678, (p) => { copy(p, 'E'); acute(p, 339, CAP + 50); });
add('at', [0x40], 726, (p) => {
  // Neometric's single-story "a" inside a ring that opens at the lower right.
  const R = 333, cx = SB + R, cy = MID, s = 0.8;
  band(p, cx, cy, R, R - S, -0.28 * Math.PI, 1.72 * Math.PI - 0.62);
  copy(p, 'a', s, cx - 236 * s, cy - MID * s);
});

const font = new opentype.Font({
  familyName: 'Neometric Extras',
  styleName: 'Medium',
  unitsPerEm: base.unitsPerEm,
  ascender: base.ascender,
  descender: base.descender,
  designer: 'Andres Sanchez (Neometric); extra glyphs for parkerrupe.xyz',
  license: 'CC BY-NC-SA 3.0. Derived from Neometric by Andres Sanchez; adds glyphs not in the original.',
  glyphs,
});

const out = new URL('../public/fonts/Neometric-Extras.otf', import.meta.url);
writeFileSync(out, Buffer.from(font.toArrayBuffer()));

const ranges = [...new Set(glyphs.flatMap((g) => g.unicodes ?? []))].sort((a, b) => a - b)
  .map((u) => 'U+' + u.toString(16).toUpperCase().padStart(4, '0'));
console.log(`wrote ${out.pathname} (${glyphs.length - 1} glyphs)`);
console.log(`unicode-range: ${ranges.join(', ')}`);

#!/usr/bin/env node
/**
 * Generates the PWA icon set into `public/icons/`.
 *
 * Deliberately dependency-free: it rasterises a tiny analytic design (a
 * torii gate on a dark rounded square) and writes the PNGs with a ~60 line
 * encoder. Pulling in a raster library to draw a handful of bars would not
 * be simpler.
 *
 *   node scripts/gen-icons.mjs
 */
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons');

// Catppuccin Mocha: base, blue, pink.
const BG = [0x1e, 0x1e, 0x2e];
const RING = [0x89, 0xb4, 0xfa];
const DOT = [0xf5, 0xc2, 0xe7];

/** CRC-32, table built once. */
const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'latin1'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

/** Encode RGBA pixel data (size*size*4) as a PNG buffer. */
function encodePng(size, rgba) {
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type: RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
/** Coverage of a shape whose signed distance is `d` (negative = inside). */
const cover = (d, aa) => clamp01(0.5 - d / aa);

function mix(dst, src, alpha) {
  for (let i = 0; i < 3; i++) dst[i] = dst[i] * (1 - alpha) + src[i] * alpha;
}

/** Signed distance to a rounded box centred at (cx, cy) with half-extents (hw, hh). */
function roundedBoxDist(px, py, cx, cy, hw, hh, r) {
  const qx = Math.abs(px - cx) - (hw - r);
  const qy = Math.abs(py - cy) - (hh - r);
  return Math.min(Math.max(qx, qy), 0) + Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) - r;
}

/**
 * @param {number} size    pixel size
 * @param {boolean} maskable when true the art shrinks into the safe zone and
 *                           the background bleeds to the edges
 */
function drawIcon(size, maskable) {
  const rgba = Buffer.alloc(size * size * 4);
  const aa = 1.5; // antialias width in pixels
  const c = size / 2;
  // Maskable icons must keep their art inside the middle 80%.
  const art = maskable ? size * 0.62 : size * 0.78;
  const radius = maskable ? size / 2 : size * 0.22; // rounded-square corner radius
  const half = art / 2;

  // Torii gate, built from three bars: a wide top lintel (kasagi), a
  // narrower crossbeam beneath it (nuki), and two vertical pillars that run
  // from the crossbeam down to the base. Proportions favour bold, blocky
  // geometry so the silhouette still reads at a 32px favicon.
  const kasagiHalfW = half * 0.98;
  const kasagiHalfH = art * 0.075;
  const kasagiCenterY = -half * 0.8;

  const nukiHalfW = half * 0.8;
  const nukiHalfH = art * 0.055;
  const nukiCenterY = -half * 0.5;

  const legHalfW = art * 0.07;
  const legInsetX = half * 0.55;
  const legTopY = nukiCenterY - nukiHalfH * 0.3;
  const legBottomY = half * 0.85;
  const legHalfH = (legBottomY - legTopY) / 2;
  const legCenterY = (legTopY + legBottomY) / 2;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const px = x + 0.5;
      const py = y + 0.5;
      const rgb = [0, 0, 0];
      let alpha = 0;

      // Background: rounded square (full bleed when maskable).
      let bgDist;
      if (maskable) {
        bgDist = -size; // fully covered
      } else {
        const qx = Math.abs(px - c) - (size / 2 - radius);
        const qy = Math.abs(py - c) - (size / 2 - radius);
        bgDist =
          Math.min(Math.max(qx, qy), 0) + Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) - radius;
      }
      const bgA = cover(bgDist, aa);
      if (bgA > 0) {
        mix(rgb, BG, 1);
        alpha = bgA;
      }

      // Torii gate: pillars and lintel in the ring colour, crossbeam in the
      // dot colour so the mark keeps the original two-tone accent.
      const lx = px - c;
      const ly = py - c;

      const legRadius = legHalfW * 0.4;
      const legDistL = roundedBoxDist(
        lx,
        ly,
        -legInsetX,
        legCenterY,
        legHalfW,
        legHalfH,
        legRadius,
      );
      const legDistR = roundedBoxDist(lx, ly, legInsetX, legCenterY, legHalfW, legHalfH, legRadius);
      const legA = cover(Math.min(legDistL, legDistR), aa);
      if (legA > 0) mix(rgb, RING, legA);

      const kasagiRadius = kasagiHalfH * 0.5;
      const kasagiDist = roundedBoxDist(
        lx,
        ly,
        0,
        kasagiCenterY,
        kasagiHalfW,
        kasagiHalfH,
        kasagiRadius,
      );
      const kasagiA = cover(kasagiDist, aa);
      if (kasagiA > 0) mix(rgb, RING, kasagiA);

      const nukiRadius = nukiHalfH * 0.5;
      const nukiDist = roundedBoxDist(lx, ly, 0, nukiCenterY, nukiHalfW, nukiHalfH, nukiRadius);
      const nukiA = cover(nukiDist, aa);
      if (nukiA > 0) mix(rgb, DOT, nukiA);

      const i = (y * size + x) * 4;
      rgba[i] = Math.round(rgb[0]);
      rgba[i + 1] = Math.round(rgb[1]);
      rgba[i + 2] = Math.round(rgb[2]);
      rgba[i + 3] = Math.round(alpha * 255);
    }
  }
  return encodePng(size, rgba);
}

const TARGETS = [
  ['icon-192.png', 192, false],
  ['icon-512.png', 512, false],
  ['icon-maskable-512.png', 512, true],
  // iOS home-screen icons are composited on an opaque tile, so the
  // rounded-square version (not the maskable one) is the right source.
  ['apple-touch-icon.png', 180, false],
  ['favicon-32.png', 32, false],
];

mkdirSync(OUT_DIR, { recursive: true });
for (const [name, size, maskable] of TARGETS) {
  const png = drawIcon(size, maskable);
  writeFileSync(join(OUT_DIR, name), png);
  console.log(`wrote icons/${name} (${size}x${size}, ${png.length} bytes)`);
}

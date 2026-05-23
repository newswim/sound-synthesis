// One-off generator for static brand assets (favicon PNGs, PWA icons, OG image).
// Pure Node built-ins (zlib) — no image deps. Run: `npm run gen:assets`.
// Source of truth for the raster files in /public; re-run to regenerate.
import zlib from 'node:zlib';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');

// ---- PNG encoder (RGBA, 8-bit) -------------------------------------------
const CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}
function encodePng(c) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(c.w, 0);
  ihdr.writeUInt32BE(c.h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  const stride = c.w * 4;
  const raw = Buffer.alloc((stride + 1) * c.h);
  for (let y = 0; y < c.h; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    Buffer.from(c.data.buffer, y * stride, stride).copy(raw, y * (stride + 1) + 1);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

// ---- tiny drawing canvas --------------------------------------------------
class Canvas {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.data = new Uint8Array(w * h * 4);
  }
  set(x, y, r, g, b, a = 255) {
    x |= 0;
    y |= 0;
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const i = (y * this.w + x) * 4;
    const ia = a / 255;
    const ib = 1 - ia;
    this.data[i] = r * ia + this.data[i] * ib;
    this.data[i + 1] = g * ia + this.data[i + 1] * ib;
    this.data[i + 2] = b * ia + this.data[i + 2] * ib;
    this.data[i + 3] = Math.min(255, a + this.data[i + 3] * ib);
  }
  rect(x, y, w, h, [r, g, b], a = 255) {
    for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) this.set(xx, yy, r, g, b, a);
  }
}

const lerp = (a, b, t) => a + (b - a) * t;
const mix = (c1, c2, t) => [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)];

// vertical gradient fill (top -> bottom)
function gradient(c, top, bottom) {
  for (let y = 0; y < c.h; y++) {
    const col = mix(top, bottom, y / (c.h - 1));
    c.rect(0, y, c.w, 1, col);
  }
}

// sine waveform stroke, connecting samples with a vertical span (thickness)
function wave(c, x0, x1, midY, amp, cycles, color, thick) {
  let prev = null;
  for (let x = x0; x <= x1; x++) {
    const t = (x - x0) / (x1 - x0);
    const y = midY - amp * Math.sin(t * cycles * 2 * Math.PI);
    const lo = prev === null ? y : Math.min(prev, y);
    const hi = prev === null ? y : Math.max(prev, y);
    for (let yy = lo - thick / 2; yy <= hi + thick / 2; yy++) c.set(x, yy, color[0], color[1], color[2]);
    prev = y;
  }
}

// ---- 5x7 uppercase bitmap font (only glyphs we need) ----------------------
const FONT = {
  A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  C: ['.###.', '#...#', '#....', '#....', '#....', '#...#', '.###.'],
  D: ['###..', '#..#.', '#...#', '#...#', '#...#', '#..#.', '###..'],
  E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  H: ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  I: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '#####'],
  L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
  N: ['#...#', '##..#', '##..#', '#.#.#', '#..##', '#...#', '#...#'],
  O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  U: ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  Y: ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'],
  '.': ['.....', '.....', '.....', '.....', '.....', '.##..', '.##..'],
  ' ': ['.....', '.....', '.....', '.....', '.....', '.....', '.....'],
};

function textWidth(str, scale) {
  return str.length * 6 * scale - scale; // 5px glyph + 1px gap, no trailing gap
}
function drawText(c, str, x, y, scale, color) {
  let cx = x;
  for (const ch of str.toUpperCase()) {
    const g = FONT[ch] || FONT[' '];
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 5; col++) {
        if (g[row][col] === '#') c.rect(cx + col * scale, y + row * scale, scale, scale, color);
      }
    }
    cx += 6 * scale;
  }
}
const centerText = (c, str, y, scale, color) => drawText(c, str, (c.w - textWidth(str, scale)) / 2, y, scale, color);

// ---- palette --------------------------------------------------------------
const TOP = [13, 12, 38];
const BOTTOM = [33, 14, 58];
const CYAN = [34, 211, 238]; // #22d3ee
const VIOLET = [167, 139, 250]; // #a78bfa
const WHITE = [237, 237, 247];

// ---- assets ---------------------------------------------------------------
function ogImage() {
  const c = new Canvas(1200, 630);
  gradient(c, TOP, BOTTOM);
  // soft accent waves behind the wordmark
  wave(c, 80, 1120, 250, 26, 3, VIOLET, 3);
  wave(c, 80, 1120, 250, 44, 1.5, CYAN, 4);
  centerText(c, 'SYNTH SCHOOL', 150, 16, WHITE);
  centerText(c, 'LEARN SOUND SYNTHESIS', 360, 6, VIOLET);
  centerText(c, 'SYNTH.COOL', 470, 6, CYAN);
  wave(c, 80, 1120, 560, 22, 6, CYAN, 4);
  return c;
}

function icon(size) {
  const c = new Canvas(size, size);
  gradient(c, TOP, BOTTOM);
  // centered waveform mark within the maskable safe zone (~62% width)
  const pad = size * 0.19;
  wave(c, pad, size - pad, size / 2, size * 0.2, 1.5, CYAN, Math.max(2, size * 0.05));
  wave(c, pad, size - pad, size / 2, size * 0.11, 3, VIOLET, Math.max(2, size * 0.035));
  return c;
}

// ---- favicon (vector SVG) -------------------------------------------------
const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0d0c26"/>
      <stop offset="1" stop-color="#21163a"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="14" fill="url(#g)"/>
  <path d="M6 32 Q19 6 32 32 T58 32" fill="none" stroke="#22d3ee" stroke-width="5" stroke-linecap="round"/>
  <path d="M6 32 Q19 48 32 32 T58 32" fill="none" stroke="#a78bfa" stroke-width="4" stroke-linecap="round" opacity="0.85"/>
</svg>
`;

const MANIFEST = {
  name: 'Synth School',
  short_name: 'Synth School',
  description: 'Learn the fundamentals of sound synthesis — interactive, in the browser.',
  start_url: '/',
  display: 'standalone',
  background_color: '#0a0a1f',
  theme_color: '#0a0a1f',
  icons: [
    { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
  ],
};

// ---- write ----------------------------------------------------------------
const write = (name, buf) => {
  writeFileSync(join(OUT, name), buf);
  console.log('wrote', name);
};
write('favicon.svg', FAVICON_SVG);
write('og-image.png', encodePng(ogImage()));
write('icon-192.png', encodePng(icon(192)));
write('icon-512.png', encodePng(icon(512)));
write('apple-touch-icon.png', encodePng(icon(180)));
write('site.webmanifest', JSON.stringify(MANIFEST, null, 2) + '\n');

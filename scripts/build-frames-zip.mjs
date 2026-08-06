/**
 * build-frames-zip.mjs
 * 
 * 1. Converts all JPG frames → WebP (quality 75, resize to 1280px max width)
 * 2. Packs them into a single frames.zip
 * 3. Outputs to public/frames.zip
 *
 * Run: node scripts/build-frames-zip.mjs
 */

import { createReadStream, createWriteStream, existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, basename } from 'path';
import { pipeline } from 'stream/promises';

// ── Dynamic imports (installed as devDeps) ──────────────────────────────────
const { default: sharp } = await import('sharp');
const { default: JSZip } = await import('jszip');

const FRAMES_DIR = 'c:\\Users\\programe\\Desktop\\coffee web\\public\\frame 2';
const OUT_FILE   = 'c:\\Users\\programe\\Desktop\\coffee web\\public\\frames.zip';
const WEBP_QUALITY = 75;   // 0-100 (75 is excellent quality/size balance)
const MAX_WIDTH    = 1280; // max width in px (hero canvas rarely needs more)

console.log('📂 Frames dir:', FRAMES_DIR);
console.log('📦 Output    :', OUT_FILE);

// ── Collect all .jpg files sorted ───────────────────────────────────────────
const files = readdirSync(FRAMES_DIR)
  .filter(f => /\.(jpg|jpeg)$/i.test(f))
  .sort();

console.log(`🖼️  Found ${files.length} frames`);

if (files.length === 0) {
  console.error('❌ No JPG files found!');
  process.exit(1);
}

// ── Convert each JPG → WebP buffer + pack into ZIP ──────────────────────────
const zip = new JSZip();
const folder = zip.folder('frame 2');

let done = 0;
const t0 = Date.now();

for (const file of files) {
  const srcPath = join(FRAMES_DIR, file);
  const webpName = file.replace(/\.(jpg|jpeg)$/i, '.webp');

  // Convert to WebP
  const webpBuf = await sharp(srcPath)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();

  folder.file(webpName, webpBuf);

  done++;
  if (done % 50 === 0 || done === files.length) {
    const pct = ((done / files.length) * 100).toFixed(1);
    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    process.stdout.write(`\r  ✅ ${done}/${files.length} (${pct}%) — ${elapsed}s`);
  }
}

console.log('\n📦 Generating ZIP...');

// ── Write ZIP to disk ────────────────────────────────────────────────────────
const zipBuffer = await zip.generateAsync({
  type: 'nodebuffer',
  compression: 'DEFLATE',
  compressionOptions: { level: 1 }, // fastest, JPGs/WebPs don't compress much anyway
});

import { writeFileSync } from 'fs';
writeFileSync(OUT_FILE, zipBuffer);

const sizeMB = (zipBuffer.length / 1024 / 1024).toFixed(2);
const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
console.log(`\n✅ Done! frames.zip = ${sizeMB} MB (${elapsed}s total)`);
console.log('   → Now update FRAME_NAMES in index.tsx to use WebP paths inside the ZIP.');

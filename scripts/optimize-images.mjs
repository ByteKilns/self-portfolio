import { mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

/**
 * Convert one image to WebP.
 *
 *   node scripts/optimize-images.mjs <input> [output] [--width N] [--quality N] [--lossless]
 *
 * Examples:
 *   node scripts/optimize-images.mjs static/new-photo.png static/new-photo.webp --width 1600 --quality 60
 *   node scripts/optimize-images.mjs src/lib/assets/logo.png src/lib/assets/logo.webp --lossless
 */

const args = process.argv.slice(2);
let input;
let output;
let width;
let quality = 80;
let lossless = false;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--width') {
    width = Number(args[++i]);
  } else if (arg === '--quality') {
    quality = Number(args[++i]);
  } else if (arg === '--lossless') {
    lossless = true;
  } else if (!input) {
    input = arg;
  } else if (!output) {
    output = arg;
  } else {
    throw new Error(`Unexpected argument: ${arg}`);
  }
}

if (!input) {
  console.error(
    'Usage: node scripts/optimize-images.mjs <input> [output] [--width N] [--quality N] [--lossless]'
  );
  process.exit(1);
}

if (width !== undefined && (!Number.isFinite(width) || width <= 0)) {
  throw new Error('--width must be a positive number');
}
if (!Number.isFinite(quality) || quality < 1 || quality > 100) {
  throw new Error('--quality must be between 1 and 100');
}

output = output ?? input.replace(/\.[^.]+$/, '') + '.webp';
await mkdir(path.dirname(output), { recursive: true });

let pipeline = sharp(input);
if (width !== undefined) {
  pipeline = pipeline.resize({ width, withoutEnlargement: true });
}

await pipeline
  .webp(lossless ? { lossless: true, effort: 6 } : { quality, effort: 6 })
  .toFile(output);

const { size } = await stat(output);
console.log(`${output} — ${(size / 1024).toFixed(1)} KB`);

if (output.startsWith('static') && size > 300 * 1024) {
  console.warn('Warning: files in static/ must stay under 300 KB (enforced by bun run test).');
}

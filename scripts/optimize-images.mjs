import { mkdir, readFile, rename, stat, unlink } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const KB = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

async function log(file) {
  const { size } = await stat(file);
  console.log(`${file} — ${KB(size)}`);
  return size;
}

async function gradientFromSvg(svgPath, outPath) {
  const svg = await readFile(svgPath, 'utf8');
  const match = svg.match(/base64,([^"']+)/);
  if (!match) throw new Error(`No base64 PNG found in ${svgPath}`);

  const png = Buffer.from(match[1], 'base64');
  await mkdir(path.dirname(outPath), { recursive: true });
  await sharp(png).resize(1200, 1200).webp({ quality: 60, effort: 6 }).toFile(outPath);
  await log(outPath);
}

async function resizeToWebp(srcPath, outPath, { width, quality }) {
  await mkdir(path.dirname(outPath), { recursive: true });
  await sharp(srcPath)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality, effort: 6 })
    .toFile(outPath);
  await log(outPath);
}

async function vectorToWebp(srcPath, outPath) {
  await mkdir(path.dirname(outPath), { recursive: true });
  const lossless = `${outPath}.lossless.webp`;
  await sharp(srcPath).webp({ lossless: true, effort: 6 }).toFile(lossless);

  const { size } = await stat(lossless);
  if (size < 150 * 1024) {
    await rename(lossless, outPath);
  } else {
    await unlink(lossless);
    await sharp(srcPath).webp({ quality: 80, effort: 6 }).toFile(outPath);
  }
  await log(outPath);
}

await gradientFromSvg('static/Gradient.svg', 'static/bg/gradient-light.webp');
await gradientFromSvg('static/Gradient-dark.svg', 'static/bg/gradient-dark.webp');
await resizeToWebp('static/modal-dark-bg.png', 'static/modal-dark-bg.webp', { width: 1600, quality: 60 });
await resizeToWebp('static/placeholder.png', 'static/placeholder.webp', { width: 1200, quality: 70 });
await vectorToWebp('src/lib/assets/vector.png', 'src/lib/assets/vector.webp');

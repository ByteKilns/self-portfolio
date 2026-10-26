import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import sharp from 'sharp';
import { validateContent } from '../../content/validate';
import type { Content } from '../../content/types';
import { slug } from '../../content/format';

export const CONTENT_PATH = join(process.cwd(), 'src/lib/data/content.json');
export const STATIC_PROJECTS_DIR = join(process.cwd(), 'static/projects');
export const MAX_IMAGE_BYTES = 300 * 1024;

export async function readContent(file = CONTENT_PATH): Promise<Content> {
  return validateContent(JSON.parse(await readFile(file, 'utf8')));
}

export async function writeContent(c: unknown, file = CONTENT_PATH): Promise<Content> {
  const content = validateContent(c);
  for (const project of content.projects) {
    if (project.image.startsWith('data:')) {
      throw new Error('invalid content: inline images not allowed');
    }
  }
  content.savedAt = Date.now();
  await mkdir(dirname(file), { recursive: true });
  const temp = `${file}.tmp`;
  await writeFile(temp, `${JSON.stringify(content, null, 2)}\n`, 'utf8');
  await rename(temp, file);
  return content;
}

export async function saveImage(
  bytes: Uint8Array,
  name: string,
  dir = STATIC_PROJECTS_DIR
): Promise<string> {
  const base = slug(name) || 'image';
  const file = join(dir, `${base}.webp`);
  await mkdir(dir, { recursive: true });
  for (const quality of [72, 55, 40]) {
    const output = await sharp(bytes)
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality })
      .toBuffer();
    if (output.byteLength <= MAX_IMAGE_BYTES) {
      await writeFile(file, output);
      return `/projects/${base}.webp`;
    }
  }
  throw new Error('image too large');
}

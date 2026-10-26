import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';
import { afterEach, expect, test } from 'vitest';
import { readContent, saveImage, writeContent } from './store';

const dirs: string[] = [];

async function tempDir() {
  const dir = await mkdtemp(join(tmpdir(), 'cms-store-'));
  dirs.push(dir);
  return dir;
}

afterEach(async () => {
  await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

const sample = {
  v: 1,
  site: {
    email: 'a@b.c',
    github: '',
    linkedin: '',
    tagline: 'tag',
    now: ['one']
  },
  projects: [
    {
      name: 'Test Project',
      summary: '',
      points: ['a point'],
      stack: ['Svelte'],
      url: '',
      image: '/projects/test.webp',
      hue: 200,
      featured: true
    }
  ]
};

test('writeContent then readContent round-trips and stamps savedAt', async () => {
  const dir = await tempDir();
  const file = join(dir, 'content.json');
  const saved = await writeContent(sample, file);
  expect(typeof saved.savedAt).toBe('number');
  const read = await readContent(file);
  expect(read).toEqual(saved);
  const text = await readFile(file, 'utf8');
  expect(text.endsWith('\n')).toBe(true);
  expect(text).toContain('\n  "v": 1');
});

test('writeContent rejects invalid content', async () => {
  const dir = await tempDir();
  const file = join(dir, 'content.json');
  await expect(writeContent({}, file)).rejects.toThrow(/invalid content/);
});

test('writeContent rejects inline images', async () => {
  const dir = await tempDir();
  const file = join(dir, 'content.json');
  const inline = {
    ...sample,
    projects: [{ ...sample.projects[0], image: 'data:image/png;base64,AA' }]
  };
  await expect(writeContent(inline, file)).rejects.toThrow(
    'invalid content: inline images not allowed'
  );
});

test('saveImage writes a webp no wider than 1600 and under 300 KB', async () => {
  const dir = await tempDir();
  const png = await sharp({
    create: { width: 2400, height: 1500, channels: 3, background: '#3b82f6' }
  })
    .png()
    .toBuffer();
  const path = await saveImage(png, 'Test Shot', dir);
  expect(path).toBe('/projects/test-shot.webp');
  const file = join(dir, 'test-shot.webp');
  const output = await readFile(file);
  const meta = await sharp(output).metadata();
  expect(meta.width).toBe(1600);
  expect(output.byteLength).toBeLessThanOrEqual(300 * 1024);
});

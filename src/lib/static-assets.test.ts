import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from 'vitest';
import { content } from '#lib/content/index.ts';

function walk(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(path));
    } else {
      files.push(path);
    }
  }
  return files;
}

test('no file in static/ is larger than 300 KB', () => {
  for (const file of walk('static')) {
    const size = statSync(file).size;
    expect(size, `${file} is ${(size / 1024).toFixed(1)} KB`).toBeLessThanOrEqual(300 * 1024);
  }
});

test('every project image points at a real file in static/', () => {
  for (const project of content.projects) {
    if (project.image === '') continue;
    expect(project.image, `${project.name} image must be a static path`).toMatch(/^\//);
    const path = join('static', project.image.replace(/^\//, ''));
    expect(
      existsSync(path),
      `${project.name} image "${project.image}" does not exist at ${path}`
    ).toBe(true);
  }
});

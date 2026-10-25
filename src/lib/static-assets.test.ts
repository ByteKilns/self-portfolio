import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from 'vitest';
import { projects } from '#lib/data/project-data.ts';

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

test('every project photoUrl points at a real file in static/', () => {
  for (const project of projects) {
    const url = project.photoUrl;
    expect(url, `${project.title} photoUrl has leading or trailing whitespace`).toBe(url.trim());
    const path = join('static', url.replace(/^\.?\//, ''));
    expect(existsSync(path), `${project.title} photoUrl "${url}" does not exist at ${path}`).toBe(true);
  }
});

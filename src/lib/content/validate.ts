import { slug } from './format';
import type { Content, Project, Site } from './types';

const DEFAULT_SITE: Site = { email: '', github: '', linkedin: '', tagline: '', now: [] };

function fail(reason: string): never {
  throw new Error(`invalid content: ${reason}`);
}

function asObject(value: unknown, reason: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) fail(reason);
  return value as Record<string, unknown>;
}

function str(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function strList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

function project(value: unknown, index: number): Project {
  const raw = asObject(value, `project at index ${index} must be an object`);
  if (typeof raw.name !== 'string') fail(`project at index ${index} must have a string name`);
  const name = raw.name;
  return {
    id: str(raw.id) || slug(name),
    name,
    summary: str(raw.summary),
    points: strList(raw.points),
    stack: strList(raw.stack),
    url: str(raw.url),
    year: str(raw.year),
    role: str(raw.role),
    client: str(raw.client),
    image: str(raw.image),
    hue: typeof raw.hue === 'number' && Number.isFinite(raw.hue) ? raw.hue : 185,
    featured: raw.featured === true,
    draft: raw.draft === true
  };
}

function site(value: unknown): Site {
  if (typeof value !== 'object' || value === null || Array.isArray(value))
    return { ...DEFAULT_SITE };
  const raw = value as Record<string, unknown>;
  return {
    email: str(raw.email, DEFAULT_SITE.email),
    github: str(raw.github, DEFAULT_SITE.github),
    linkedin: str(raw.linkedin, DEFAULT_SITE.linkedin),
    tagline: str(raw.tagline, DEFAULT_SITE.tagline),
    now: strList(raw.now)
  };
}

export function validateContent(x: unknown): Content {
  const raw = asObject(x, 'expected an object');
  if (!Array.isArray(raw.projects)) fail('projects must be an array');

  return {
    v: 1,
    site: site(raw.site),
    projects: raw.projects.map(project),
    savedAt: typeof raw.savedAt === 'number' && Number.isFinite(raw.savedAt) ? raw.savedAt : null
  };
}

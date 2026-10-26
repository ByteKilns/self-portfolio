import raw from '../data/content.json';
import type { Content, Project } from './types';
import { validateContent } from './validate';

export const content: Content = validateContent(raw);

export function liveProjects(c: Content = content): Project[] {
  return c.projects.filter((p) => !p.draft && p.name.trim() !== '');
}

export function featured(list: Project[]): (Project & { idx: number })[] {
  return list.map((p, idx) => ({ ...p, idx })).filter((p) => p.featured);
}

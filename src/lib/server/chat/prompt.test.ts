import { describe, expect, it } from 'vitest';
import type { Project } from '#lib/types.ts';
import { buildMessages } from './prompt';

const cv = '# Nirjal\n\nFullstack developer with 2+ years of experience.';

const projects: Project[] = [
  {
    title: 'Alpha Project',
    position: 'left',
    deployed: true,
    isLinkAvailable: true,
    githublink: 'https://github.com/example/alpha',
    websitelink: 'https://alpha.example.com',
    photoUrl: '/placeholder.webp',
    description: ['First line', 'Second line'],
    TechStack: ['Svelte', 'TypeScript']
  },
  {
    title: 'Beta Project',
    position: 'right',
    deployed: false,
    isLinkAvailable: false,
    githublink: '',
    websitelink: 'https://beta.example.com',
    photoUrl: '/placeholder.webp',
    description: ['Beta line'],
    TechStack: ['React']
  }
];

const today = new Date('2026-10-25T12:00:00Z');
const history = [
  { role: 'user' as const, content: 'earlier question' },
  { role: 'assistant' as const, content: 'earlier answer' }
];
const message = 'What are his skills?';

describe('buildMessages', () => {
  const messages = buildMessages({ cv, projects, history, message, today });

  it('starts with a system message containing the CV, every project title and today', () => {
    expect(messages[0].role).toBe('system');
    expect(messages[0].content).toContain(cv);
    for (const project of projects) {
      expect(messages[0].content).toContain(project.title);
    }
    expect(messages[0].content).toContain('2026-10-25');
  });

  it('includes the anti-injection instruction', () => {
    expect(messages[0].content).toContain('only answer questions about Nirjal');
  });

  it('uses the CV experience summary instead of recalculating dates', () => {
    expect(messages[0].content).toContain('Experience summary');
    expect(messages[0].content).toContain('Do not extend a role past its end date');
  });

  it('puts the history in order after the system message', () => {
    expect(messages.slice(1, 3)).toEqual(history);
  });

  it('ends with the new user message', () => {
    expect(messages.at(-1)).toEqual({ role: 'user', content: message });
  });
});

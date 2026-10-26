import { describe, expect, it } from 'vitest';
import type { Project } from '#lib/content/types.ts';
import { buildMessages } from './prompt';

const cv = '# Nirjal\n\nFullstack developer with 2+ years of experience.';

const projects: Project[] = [
  {
    id: 'alpha-project',
    name: 'Alpha Project',
    summary: 'A one-line summary.',
    points: ['First line', 'Second line'],
    stack: ['Svelte', 'TypeScript'],
    url: 'https://alpha.example.com',
    year: '',
    role: '',
    client: '',
    image: '',
    hue: 185,
    featured: true,
    draft: false
  },
  {
    id: 'beta-project',
    name: 'Beta Project',
    summary: '',
    points: ['Beta line'],
    stack: ['React'],
    url: '',
    year: '',
    role: '',
    client: '',
    image: '',
    hue: 205,
    featured: false,
    draft: false
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
  const system = messages[0].content;

  it('starts with a system message containing the CV, every project title and today', () => {
    expect(messages[0].role).toBe('system');
    expect(system).toContain(cv);
    for (const project of projects) {
      expect(system).toContain(project.name);
    }
    expect(system).toContain('2026-10-25');
  });

  it('renders a project block in the documented order', () => {
    expect(system).toContain(
      '## Alpha Project\nA one-line summary.\n- First line\n- Second line\nTech: Svelte, TypeScript\nLive: https://alpha.example.com'
    );
  });

  it('omits the summary line when the summary is empty', () => {
    expect(system).toContain('## Beta Project\n- Beta line\nTech: React');
  });

  it('omits the Live line when the url is empty', () => {
    const beta = system.slice(system.indexOf('## Beta Project'));
    expect(beta).not.toContain('Live:');
  });

  it('includes the anti-injection instruction', () => {
    expect(system).toContain('only answer questions about Nirjal');
  });

  it('uses the CV experience summary instead of recalculating dates', () => {
    expect(system).toContain('Experience summary');
    expect(system).toContain('Do not extend a role past its end date');
  });

  it('puts the history in order after the system message', () => {
    expect(messages.slice(1, 3)).toEqual(history);
  });

  it('ends with the new user message', () => {
    expect(messages.at(-1)).toEqual({ role: 'user', content: message });
  });
});

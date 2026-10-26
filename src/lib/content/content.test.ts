import { describe, expect, it } from 'vitest';
import { content, featured, liveProjects } from './index';
import { validateContent } from './validate';

const base = {
  v: 1,
  site: { email: 'a@b.c', github: '', linkedin: '', tagline: 't', now: [] },
  projects: [],
  savedAt: null
};

describe('validateContent', () => {
  it('rejects a non-object', () => {
    expect(() => validateContent(null)).toThrow(/invalid content/);
    expect(() => validateContent('nope')).toThrow(/invalid content/);
    expect(() => validateContent([])).toThrow(/invalid content/);
  });

  it('rejects a missing projects array', () => {
    expect(() => validateContent({})).toThrow(/invalid content/);
  });

  it('rejects a project without a string name', () => {
    expect(() => validateContent({ ...base, projects: [{ name: 3 }] })).toThrow(/invalid content/);
    expect(() => validateContent({ ...base, projects: [{}] })).toThrow(/invalid content/);
  });

  it('fills missing optional fields with defaults', () => {
    const result = validateContent({ projects: [{ name: 'Alpha' }] });
    expect(result.projects[0]).toEqual({
      id: 'alpha',
      name: 'Alpha',
      summary: '',
      points: [],
      stack: [],
      url: '',
      year: '',
      role: '',
      client: '',
      image: '',
      hue: 185,
      featured: false,
      draft: false
    });
    expect(result.v).toBe(1);
    expect(result.savedAt).toBeNull();
    expect(result.site).toEqual({ email: '', github: '', linkedin: '', tagline: '', now: [] });
  });
});

describe('liveProjects', () => {
  it('drops drafts and blank names', () => {
    const c = validateContent({
      ...base,
      projects: [
        { name: 'Live' },
        { name: 'Draft', draft: true },
        { name: '   ' },
        { name: 'Also live', draft: false }
      ]
    });
    expect(liveProjects(c).map((p) => p.name)).toEqual(['Live', 'Also live']);
  });
});

describe('featured', () => {
  it('keeps the index from the live list', () => {
    const c = validateContent({
      ...base,
      projects: [{ name: 'A' }, { name: 'B', featured: true }, { name: 'C', featured: true }]
    });
    expect(featured(liveProjects(c)).map((p) => p.idx)).toEqual([1, 2]);
  });
});

describe('seeded content', () => {
  it('has 7 projects with the three featured ones first', () => {
    expect(content.projects).toHaveLength(7);
    const feat = featured(liveProjects());
    expect(feat).toHaveLength(3);
    expect(feat.map((p) => p.name)).toEqual([
      'Aastha Saving and Cooperative Limited',
      'Deshna IT',
      'IBM Nepal'
    ]);
  });
});

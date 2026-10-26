import { describe, expect, it } from 'vitest';
import { host, mono, pad, parts, slug, tint } from './format';

describe('pad', () => {
  it('pads to two digits', () => {
    expect(pad(0)).toBe('00');
    expect(pad(3)).toBe('03');
    expect(pad(12)).toBe('12');
  });
});

describe('mono', () => {
  it('takes the first letter of the first two words', () => {
    expect(mono('Deshna IT')).toBe('DI');
    expect(mono('Aastha Saving and Cooperative Limited')).toBe('AS');
  });

  it('falls back to a question mark', () => {
    expect(mono('')).toBe('?');
  });
});

describe('slug', () => {
  it('lowercases and hyphenates', () => {
    expect(slug('IBM Nepal')).toBe('ibm-nepal');
    expect(slug('  Aastha Saving & Cooperative  ')).toBe('aastha-saving-cooperative');
  });
});

describe('host', () => {
  it('returns the host without www', () => {
    expect(host('https://www.x.com/a')).toBe('x.com');
    expect(host('https://deshna.example.com/path')).toBe('deshna.example.com');
  });

  it('returns an empty string for a bad url', () => {
    expect(host('not a url')).toBe('');
    expect(host('')).toBe('');
  });
});

describe('parts', () => {
  it('splits on double stars and marks the bold segments', () => {
    expect(parts('a **b** c')).toEqual([
      { t: 'a ', b: false },
      { t: 'b', b: true },
      { t: ' c', b: false }
    ]);
  });

  it('drops empty segments', () => {
    expect(parts('')).toEqual([]);
    expect(parts('**bold**')).toEqual([{ t: 'bold', b: true }]);
  });
});

describe('tint', () => {
  it('matches the design gradients exactly', () => {
    expect(tint(185, true)).toBe(
      'linear-gradient(135deg,oklch(0.42 0.08 185),oklch(0.17 0.035 185) 78%)'
    );
    expect(tint(185, false)).toBe(
      'linear-gradient(135deg,oklch(0.86 0.07 185),oklch(0.97 0.02 185) 78%)'
    );
  });
});

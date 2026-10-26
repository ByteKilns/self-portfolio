import { describe, expect, it } from 'vitest';
import { createBit, ease, perches, step, type BitEnv } from './bit-engine';

const fakeEl = (rect: Partial<DOMRect>, dataset: Record<string, string> = {}) =>
  ({
    dataset,
    getBoundingClientRect: () =>
      ({
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        toJSON: () => ({}),
        ...rect
      }) as DOMRect
  }) as unknown as Element;

const env = (overrides: Partial<BitEnv> = {}): BitEnv => ({
  vw: 1440,
  vh: 900,
  W: 110,
  narrow: false,
  motion: false,
  ptr: { x: 0, y: 0 },
  floorRect: null,
  emailRect: null,
  perchEls: [],
  lure: false,
  cursor: false,
  hover: false,
  say: () => {},
  ...overrides
});

describe('ease', () => {
  it('is symmetric and clamps the ends', () => {
    expect(ease(0)).toBe(0);
    expect(ease(0.5)).toBe(0.5);
    expect(ease(1)).toBe(1);
  });
});

describe('perches', () => {
  it('rejects a perch above the header', () => {
    const H = 110 * 0.66;
    const el = fakeEl({ left: 500, top: 100, right: 700, bottom: 140, width: 200, height: 40 });
    expect(perches(H, 1440, 900, [el])).toEqual([]);
  });

  it('accepts a perch centered in the viewport', () => {
    const H = 110 * 0.66;
    const el = fakeEl(
      { left: 500, top: 400, right: 700, bottom: 440, width: 200, height: 40 },
      { perch: 'top', px: '0.85', say: 'hello' }
    );
    const list = perches(H, 1440, 900, [el]);
    expect(list).toHaveLength(1);
    expect(list[0].x).toBeCloseTo(500 + 200 * 0.85);
    expect(list[0].y).toBe(400);
    expect(list[0].say).toBe('hello');
  });
});

describe('step', () => {
  it('parks Bit in the bottom-right corner when there are no perches and motion is off', () => {
    const b = createBit();
    const Hp = 110 * 0.66;
    step(b, 1000, env());
    expect(b.px).toBeCloseTo(1440 - Hp * 0.9);
    expect(b.py).toBeCloseTo(900 + Hp * 0.36);
    expect(b.mode).toBe('perch');
  });

  it('says each perch line once', () => {
    const b = createBit();
    const said: string[] = [];
    const el = fakeEl(
      { left: 500, top: 400, right: 700, bottom: 440, width: 200, height: 40 },
      { perch: 'top', px: '0.85', say: 'the good stuff →' }
    );
    const e = env({ perchEls: [el], say: (text) => said.push(text) });
    step(b, 1000, e);
    step(b, 1200, e);
    step(b, 1400, e);
    expect(said.filter((t) => t === 'the good stuff →')).toHaveLength(1);
  });
});

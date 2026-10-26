import { expect, test } from 'vitest';
import { devOnly } from './guard';

test('devOnly throws a 404 outside dev', () => {
  try {
    devOnly(false);
    expect.unreachable('devOnly(false) should throw');
  } catch (error) {
    expect((error as { status?: number }).status).toBe(404);
    expect((error as { body?: { message?: string } }).body?.message).toBe('Not found');
  }
});

test('devOnly allows dev', () => {
  expect(() => devOnly(true)).not.toThrow();
});

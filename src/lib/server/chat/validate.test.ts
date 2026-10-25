import { describe, expect, it } from 'vitest';
import { MAX_HISTORY, MAX_MESSAGE_CHARS, parseChatRequest } from './validate';

const okTurn = { role: 'user' as const, content: 'hello' };

describe('parseChatRequest', () => {
  it('rejects bodies that are not objects', () => {
    for (const body of [null, undefined, 'hi', 42, [], true]) {
      const result = parseChatRequest(body);
      expect(result.ok, JSON.stringify(body)).toBe(false);
    }
  });

  it('rejects a missing, empty or whitespace-only message', () => {
    for (const body of [{}, { message: '' }, { message: '   ' }, { message: 42 }]) {
      const result = parseChatRequest(body);
      expect(result.ok, JSON.stringify(body)).toBe(false);
    }
  });

  it('rejects messages longer than the cap', () => {
    const result = parseChatRequest({ message: 'a'.repeat(MAX_MESSAGE_CHARS + 1) });
    expect(result.ok).toBe(false);
  });

  it('rejects a history that is not an array or is too long', () => {
    expect(parseChatRequest({ message: 'hi', history: 'nope' }).ok).toBe(false);
    expect(
      parseChatRequest({ message: 'hi', history: Array.from({ length: MAX_HISTORY + 1 }, () => okTurn) }).ok
    ).toBe(false);
  });

  it('rejects history items with the wrong role or non-string content', () => {
    expect(parseChatRequest({ message: 'hi', history: [{ role: 'system', content: 'x' }] }).ok).toBe(false);
    expect(parseChatRequest({ message: 'hi', history: [{ role: 'user', content: 42 }] }).ok).toBe(false);
  });

  it('trims the message and returns valid history', () => {
    const result = parseChatRequest({ message: '  hi  ', history: [] });
    expect(result).toEqual({ ok: true, message: 'hi', history: [] });
  });

  it('treats a missing history as empty', () => {
    expect(parseChatRequest({ message: 'hi' })).toEqual({ ok: true, message: 'hi', history: [] });
  });

  it('returns the history in order', () => {
    const history = [
      { role: 'user' as const, content: 'one' },
      { role: 'assistant' as const, content: 'two' }
    ];
    const result = parseChatRequest({ message: 'three', history });
    expect(result).toEqual({ ok: true, message: 'three', history });
  });
});

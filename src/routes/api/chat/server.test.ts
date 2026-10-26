import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { RequestEvent } from '@sveltejs/kit';
import type { LlmMessage } from '#lib/chat/types.ts';

const mockEnv = vi.hoisted(() => ({
  GEMINI_API_KEY: 'test-key' as string | undefined,
  GEMINI_MODEL: 'gemini-3.8-flash' as string | undefined
}));
vi.mock('$app/env/private', () => mockEnv);

import { createRateLimiter } from '#lib/server/chat/rateLimit.ts';
import { ChatUpstreamError, streamChat as realStreamChat } from '#lib/server/chat/gemini.ts';
import { _handleChat } from './+server';

type StreamChat = typeof realStreamChat;
type Limiters = {
  minute: ReturnType<typeof createRateLimiter>;
  day: ReturnType<typeof createRateLimiter>;
};

const now = () => new Date('2026-10-25T12:00:00Z');

function freshLimiters(overrides: { minute?: number; day?: number } = {}): Limiters {
  return {
    minute: createRateLimiter({ limit: overrides.minute ?? 10, windowMs: 60_000 }),
    day: createRateLimiter({ limit: overrides.day ?? 60, windowMs: 86_400_000 })
  };
}

function makeEvent(
  body: unknown,
  opts: { origin?: string | null; ip?: string; signal?: AbortSignal; rawBody?: string } = {}
): RequestEvent {
  const url = new URL('http://localhost/api/chat');
  const headers = new Headers({ 'content-type': 'application/json' });
  if (opts.origin !== null) headers.set('origin', opts.origin ?? url.origin);
  const request = new Request(url, {
    method: 'POST',
    headers,
    body: opts.rawBody ?? JSON.stringify(body),
    signal: opts.signal
  });
  return { request, url, getClientAddress: () => opts.ip ?? '1.2.3.4' } as unknown as RequestEvent;
}

function fakeStream(chunks: string[]): StreamChat {
  return async function* () {
    for (const chunk of chunks) yield chunk;
  } as unknown as StreamChat;
}

const validBody = { message: 'What does Nirjal do?', history: [] };

let errorSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  mockEnv.GEMINI_API_KEY = 'test-key';
  mockEnv.GEMINI_MODEL = 'gemini-3.8-flash';
  errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  errorSpy.mockRestore();
});

describe('_handleChat origin check', () => {
  it('rejects a request from a different origin', async () => {
    const response = await _handleChat(makeEvent(validBody, { origin: 'https://example.com' }), {
      streamChat: fakeStream(['Hi']),
      limiters: freshLimiters(),
      now
    });
    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: 'Forbidden.' });
  });

  it('rejects a request with no Origin header', async () => {
    const response = await _handleChat(makeEvent(validBody, { origin: null }), {
      streamChat: fakeStream(['Hi']),
      limiters: freshLimiters(),
      now
    });
    expect(response.status).toBe(403);
  });
});

describe('_handleChat validation', () => {
  it('returns 400 with the parse error for an invalid body', async () => {
    const response = await _handleChat(makeEvent({ message: '   ' }), {
      streamChat: fakeStream(['Hi']),
      limiters: freshLimiters(),
      now
    });
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'Message is required.' });
  });
});

describe('_handleChat rate limits', () => {
  it('returns 429 and Retry-After on the 11th request in a minute', async () => {
    const limiters = freshLimiters();
    const deps = { streamChat: fakeStream(['Hi']), limiters, now };

    for (let i = 0; i < 10; i++) {
      const response = await _handleChat(makeEvent(validBody), deps);
      expect(response.status).toBe(200);
      await response.text();
    }

    const response = await _handleChat(makeEvent(validBody), deps);
    expect(response.status).toBe(429);
    expect(response.headers.get('retry-after')).toMatch(/^\d+$/);
    expect(Number(response.headers.get('retry-after'))).toBeGreaterThan(0);
    await expect(response.json()).resolves.toEqual({
      error: 'Too many messages — please wait a minute.'
    });
  });

  it('returns 429 on the 61st request in a day', async () => {
    const limiters = freshLimiters({ minute: 1000, day: 60 });
    const deps = { streamChat: fakeStream(['Hi']), limiters, now };

    for (let i = 0; i < 60; i++) {
      const response = await _handleChat(makeEvent(validBody), deps);
      expect(response.status).toBe(200);
      await response.text();
    }

    const response = await _handleChat(makeEvent(validBody), deps);
    expect(response.status).toBe(429);
    expect(response.headers.get('retry-after')).toMatch(/^\d+$/);
    await expect(response.json()).resolves.toEqual({
      error: 'Too many messages — please wait a minute.'
    });
  });
});

describe('_handleChat streaming', () => {
  it('streams the answer as plain text', async () => {
    const response = await _handleChat(makeEvent(validBody), {
      streamChat: fakeStream(['Hi', ' there']),
      limiters: freshLimiters(),
      now
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toMatch(/^text\/plain/);
    await expect(response.text()).resolves.toBe('Hi there');
  });

  it('maps a 429 from Gemini to 503 with the busy message', async () => {
    const failing = async function* () {
      throw new ChatUpstreamError(429, 'rate limited');
    } as unknown as StreamChat;

    const response = await _handleChat(makeEvent(validBody), {
      streamChat: failing,
      limiters: freshLimiters(),
      now
    });

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: 'The chat is busy right now — please try again in a minute.'
    });
  });

  it('maps any other upstream error to 502', async () => {
    const failing = async function* () {
      throw new Error('boom');
    } as unknown as StreamChat;

    const response = await _handleChat(makeEvent(validBody), {
      streamChat: failing,
      limiters: freshLimiters(),
      now
    });

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      error: 'The chat is unavailable right now.'
    });
  });

  it('passes request.signal through and ends cleanly when aborted mid-stream', async () => {
    const controller = new AbortController();
    let receivedSignal: AbortSignal | undefined;

    const waiting = async function* (_messages: LlmMessage[], opts: { signal?: AbortSignal }) {
      receivedSignal = opts.signal;
      yield 'Hi';
      await new Promise<void>((resolve) => {
        if (opts.signal?.aborted) return resolve();
        opts.signal?.addEventListener('abort', () => resolve(), { once: true });
      });
    } as unknown as StreamChat;

    const event = makeEvent(validBody, { signal: controller.signal });
    const response = await _handleChat(event, {
      streamChat: waiting,
      limiters: freshLimiters(),
      now
    });

    expect(response.status).toBe(200);
    expect(receivedSignal).toBe(event.request.signal);

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    const first = await reader.read();
    expect(decoder.decode(first.value)).toBe('Hi');

    controller.abort();

    let rest = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      rest += decoder.decode(value);
    }
    expect(rest).toBe('');
  });

  it('returns 503 and logs once when GEMINI_API_KEY is missing', async () => {
    mockEnv.GEMINI_API_KEY = undefined;

    const response = await _handleChat(makeEvent(validBody), {
      streamChat: fakeStream(['Hi']),
      limiters: freshLimiters(),
      now
    });

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: 'The chat is unavailable right now.'
    });
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(String(errorSpy.mock.calls[0][0])).toContain('GEMINI_API_KEY');
  });
});

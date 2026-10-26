import { describe, expect, it } from 'vitest';
import { ChatUpstreamError, streamChat } from './gemini';
import type { LlmMessage } from '#lib/chat/types.ts';

const URL = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
const messages: LlmMessage[] = [
  { role: 'system', content: 'be nice' },
  { role: 'user', content: 'hi' }
];

function streamFrom(chunks: string[], status = 200) {
  return new Response(
    new ReadableStream<Uint8Array>({
      start(controller) {
        const encoder = new TextEncoder();
        for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
        controller.close();
      }
    }),
    { status, headers: { 'content-type': 'text/event-stream' } }
  );
}

async function collect(generator: AsyncGenerator<string>) {
  const out: string[] = [];
  for await (const chunk of generator) out.push(chunk);
  return out;
}

const twoChunks =
  'data: {"choices":[{"delta":{"content":"Hel"}}]}\n\n' +
  'data: {"choices":[{"delta":{"content":"lo"}}]}\n\n' +
  'data: [DONE]\n\n';

describe('streamChat', () => {
  it('yields the content from SSE data lines', async () => {
    const fetchFn = (async () => streamFrom([twoChunks])) as typeof fetch;
    expect(
      await collect(streamChat(messages, { apiKey: 'key', model: 'test-model', fetchFn }))
    ).toEqual(['Hel', 'lo']);
  });

  it('handles bytes split mid-line across chunks', async () => {
    const fetchFn = (async () =>
      streamFrom([
        'data: {"choices":[{"del',
        'ta":{"content":"Hel"}}]}\n\ndata: {"choices":[{"delta":{"content":"lo"}}]}\n\ndata: [DO',
        'NE]\n\n'
      ])) as typeof fetch;
    expect(
      await collect(streamChat(messages, { apiKey: 'key', model: 'test-model', fetchFn }))
    ).toEqual(['Hel', 'lo']);
  });

  it('skips events without delta.content', async () => {
    const fetchFn = (async () =>
      streamFrom([
        'data: {"choices":[{"delta":{}}]}\n\n',
        ': keep-alive\n\n',
        'data: {"choices":[{"delta":{"content":"Hel"}}]}\n\n',
        'data: {"choices":[]}\n\n',
        'data: {"choices":[{"delta":{"content":"lo"}}]}\n\n',
        'data: [DONE]\n\n'
      ])) as typeof fetch;
    expect(
      await collect(streamChat(messages, { apiKey: 'key', model: 'test-model', fetchFn }))
    ).toEqual(['Hel', 'lo']);
  });

  it('throws ChatUpstreamError(429) on a rate-limited response', async () => {
    const fetchFn = (async () => new Response('rate limited', { status: 429 })) as typeof fetch;
    const error = await collect(
      streamChat(messages, { apiKey: 'key', model: 'test-model', fetchFn })
    ).catch((e) => e);
    expect(error).toBeInstanceOf(ChatUpstreamError);
    expect(error.status).toBe(429);
  });

  it('throws ChatUpstreamError with the response status for other failures', async () => {
    const fetchFn = (async () => new Response('boom', { status: 500 })) as typeof fetch;
    const error = await collect(
      streamChat(messages, { apiKey: 'key', model: 'test-model', fetchFn })
    ).catch((e) => e);
    expect(error).toBeInstanceOf(ChatUpstreamError);
    expect(error.status).toBe(500);
  });

  it('sends an authorised streaming request to the Gemini endpoint', async () => {
    let calledUrl = '';
    let calledInit: RequestInit | undefined;
    const fetchFn = (async (input: RequestInfo | URL, init?: RequestInit) => {
      calledUrl = String(input);
      calledInit = init;
      return streamFrom([twoChunks]);
    }) as typeof fetch;

    await collect(streamChat(messages, { apiKey: 'secret-key', model: 'test-model', fetchFn }));

    expect(calledUrl).toBe(URL);
    expect(new Headers(calledInit?.headers).get('authorization')).toBe('Bearer secret-key');
    const body = JSON.parse(String(calledInit?.body));
    expect(body.model).toBe('test-model');
    expect(body.stream).toBe(true);
    expect(body.messages).toEqual(messages);
  });

  it('passes the abort signal through to fetch', async () => {
    const controller = new AbortController();
    let calledSignal: AbortSignal | null | undefined;
    const fetchFn = (async (_input: RequestInfo | URL, init?: RequestInit) => {
      calledSignal = init?.signal;
      return streamFrom([twoChunks]);
    }) as typeof fetch;

    await collect(
      streamChat(messages, {
        apiKey: 'key',
        model: 'test-model',
        signal: controller.signal,
        fetchFn
      })
    );
    expect(calledSignal).toBe(controller.signal);
  });
});

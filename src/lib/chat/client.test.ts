import { describe, expect, it } from 'vitest';
import type { ChatTurn } from '#lib/chat/types.ts';
import { sendChat } from './client';

function responseFrom(chunks: string[], status = 200) {
  return new Response(
    new ReadableStream<Uint8Array>({
      start(controller) {
        const encoder = new TextEncoder();
        for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
        controller.close();
      }
    }),
    { status, headers: { 'content-type': 'text/plain; charset=utf-8' } }
  );
}

const history: ChatTurn[] = [
  { role: 'user', content: 'earlier question' },
  { role: 'assistant', content: 'earlier answer' }
];

describe('sendChat', () => {
  it('posts the message and history to /api/chat and streams chunks in order', async () => {
    let calledUrl = '';
    let calledInit: RequestInit | undefined;

    const fetchFn = (async (input: RequestInfo | URL, init?: RequestInit) => {
      calledUrl = String(input);
      calledInit = init;
      return responseFrom(['Hi', ' there']);
    }) as typeof fetch;

    const chunks: string[] = [];
    await sendChat({
      message: 'hello',
      history,
      onChunk: (text) => chunks.push(text),
      fetchFn
    });

    expect(calledUrl).toBe('/api/chat');
    expect(calledInit?.method).toBe('POST');
    expect(JSON.parse(String(calledInit?.body))).toEqual({ message: 'hello', history });
    expect(chunks).toEqual(['Hi', ' there']);
  });

  it('throws the server error message on a non-200 response', async () => {
    const fetchFn = (async () =>
      new Response(JSON.stringify({ error: 'Too many messages — please wait a minute.' }), {
        status: 429,
        headers: { 'content-type': 'application/json' }
      })) as typeof fetch;

    await expect(
      sendChat({ message: 'hello', history: [], onChunk: () => {}, fetchFn })
    ).rejects.toThrow('Too many messages — please wait a minute.');
  });
});

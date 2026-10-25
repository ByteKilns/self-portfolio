import type { LlmMessage } from '$lib/chat/types';

const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';

export class ChatUpstreamError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ChatUpstreamError';
  }
}

export async function* streamChat(
  messages: LlmMessage[],
  opts: {
    apiKey: string;
    model: string;
    signal?: AbortSignal;
    fetchFn?: typeof fetch;
  }
): AsyncGenerator<string> {
  const fetchFn = opts.fetchFn ?? fetch;
  const response = await fetchFn(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${opts.apiKey}`
    },
    body: JSON.stringify({ model: opts.model, messages, stream: true }),
    signal: opts.signal
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new ChatUpstreamError(response.status, detail || `Gemini responded with ${response.status}`);
  }
  if (!response.body) {
    throw new ChatUpstreamError(502, 'Gemini returned an empty response body.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let newline = buffer.indexOf('\n');
      while (newline !== -1) {
        const line = buffer.slice(0, newline).replace(/\r$/, '');
        buffer = buffer.slice(newline + 1);
        const content = parseDataLine(line);
        if (content !== undefined) yield content;
        newline = buffer.indexOf('\n');
      }
    }

    buffer += decoder.decode();
    const tail = buffer.replace(/\r$/, '');
    if (tail) {
      const content = parseDataLine(tail);
      if (content !== undefined) yield content;
    }
  } finally {
    reader.releaseLock();
  }
}

function parseDataLine(line: string): string | undefined {
  if (!line.startsWith('data: ')) return undefined;

  const payload = line.slice('data: '.length).trim();
  if (!payload || payload === '[DONE]') return undefined;

  try {
    const parsed = JSON.parse(payload);
    const content = parsed?.choices?.[0]?.delta?.content;
    return typeof content === 'string' && content.length > 0 ? content : undefined;
  } catch {
    return undefined;
  }
}

import type { ChatTurn } from '#lib/chat/types.ts';

export async function sendChat(input: {
  message: string;
  history: ChatTurn[];
  onChunk: (text: string) => void;
  signal?: AbortSignal;
  fetchFn?: typeof fetch;
}): Promise<void> {
  const fetchFn = input.fetchFn ?? fetch;
  const response = await fetchFn('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: input.message, history: input.history }),
    signal: input.signal
  });

  if (!response.ok) {
    let message = 'The chat is unavailable right now.';
    try {
      const body = await response.json();
      if (body && typeof body.error === 'string' && body.error) {
        message = body.error;
      }
    } catch {
      // Non-JSON error body; keep the generic message.
    }
    throw new Error(message);
  }

  if (!response.body) return;

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const text = decoder.decode(value, { stream: true });
      if (text) input.onChunk(text);
    }

    const tail = decoder.decode();
    if (tail) input.onChunk(tail);
  } finally {
    reader.releaseLock();
  }
}

import type { ChatTurn } from '$lib/chat/types';

export const MAX_MESSAGE_CHARS = 1000;
export const MAX_HISTORY = 6;

export function parseChatRequest(
  body: unknown
): { ok: true; message: string; history: ChatTurn[] } | { ok: false; error: string } {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return { ok: false, error: 'Request body must be an object.' };
  }

  const { message, history } = body as { message?: unknown; history?: unknown };

  if (typeof message !== 'string' || message.trim().length === 0) {
    return { ok: false, error: 'Message is required.' };
  }

  const trimmed = message.trim();
  if (trimmed.length > MAX_MESSAGE_CHARS) {
    return { ok: false, error: `Message must be at most ${MAX_MESSAGE_CHARS} characters.` };
  }

  if (history !== undefined && !Array.isArray(history)) {
    return { ok: false, error: 'History must be an array.' };
  }

  const rawHistory = history ?? [];
  if (rawHistory.length > MAX_HISTORY) {
    return { ok: false, error: `History must be at most ${MAX_HISTORY} turns.` };
  }

  const turns: ChatTurn[] = [];
  for (const item of rawHistory) {
    if (typeof item !== 'object' || item === null) {
      return { ok: false, error: 'Invalid history item.' };
    }
    const { role, content } = item as { role?: unknown; content?: unknown };
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') {
      return { ok: false, error: 'Invalid history item.' };
    }
    turns.push({ role, content });
  }

  return { ok: true, message: trimmed, history: turns };
}

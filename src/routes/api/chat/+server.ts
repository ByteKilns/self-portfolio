import type { RequestEvent } from '@sveltejs/kit';
import * as env from '$app/env/private';
import cv from '#lib/server/cv.md?raw';
import { projects } from '#lib/data/project-data.ts';
import { ChatUpstreamError, streamChat } from '#lib/server/chat/gemini.ts';
import { buildMessages } from '#lib/server/chat/prompt.ts';
import { createRateLimiter } from '#lib/server/chat/rateLimit.ts';
import { parseChatRequest } from '#lib/server/chat/validate.ts';

type RateLimiter = ReturnType<typeof createRateLimiter>;

type ChatDeps = {
  streamChat: typeof streamChat;
  limiters: { minute: RateLimiter; day: RateLimiter };
  now?: () => Date;
};

const DEFAULT_MODEL = 'gemini-3.5-flash-lite';
const RATE_LIMIT_ERROR = 'Too many messages — please wait a minute.';
const UNAVAILABLE_ERROR = 'The chat is unavailable right now.';
const BUSY_ERROR = 'The chat is busy right now — please try again in a minute.';
const CUT_OFF = '\n\n[The answer was cut off — please ask again.]';

const limiters: { minute: RateLimiter; day: RateLimiter } = {
  minute: createRateLimiter({ limit: 10, windowMs: 60_000 }),
  day: createRateLimiter({ limit: 60, windowMs: 86_400_000 })
};

function jsonError(error: string, status: number, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { 'content-type': 'application/json', ...headers }
  });
}

export async function _handleChat(event: RequestEvent, deps: ChatDeps): Promise<Response> {
  const { request, url } = event;

  const origin = request.headers.get('origin');
  if (origin !== url.origin) {
    return jsonError('Forbidden.', 403);
  }

  const ip = event.getClientAddress();
  const minute = deps.limiters.minute.check(ip);
  if (!minute.allowed) {
    return jsonError(RATE_LIMIT_ERROR, 429, {
      'retry-after': String(Math.ceil(minute.retryAfterMs / 1000))
    });
  }
  const day = deps.limiters.day.check(ip);
  if (!day.allowed) {
    return jsonError(RATE_LIMIT_ERROR, 429, {
      'retry-after': String(Math.ceil(day.retryAfterMs / 1000))
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON body.', 400);
  }

  const parsed = parseChatRequest(body);
  if (!parsed.ok) {
    return jsonError(parsed.error, 400);
  }

  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Missing GEMINI_API_KEY environment variable; /api/chat is unavailable.');
    return jsonError(UNAVAILABLE_ERROR, 503);
  }
  const model = env.GEMINI_MODEL || DEFAULT_MODEL;

  const messages = buildMessages({
    cv,
    projects,
    history: parsed.history,
    message: parsed.message,
    today: deps.now?.() ?? new Date()
  });

  const generator = deps.streamChat(messages, {
    apiKey,
    model,
    signal: request.signal
  });

  let first: IteratorResult<string>;
  try {
    first = await generator.next();
  } catch (error) {
    if (error instanceof ChatUpstreamError && error.status === 429) {
      return jsonError(BUSY_ERROR, 503);
    }
    return jsonError(UNAVAILABLE_ERROR, 502);
  }

  if (first.done) {
    return new Response('', { headers: { 'content-type': 'text/plain; charset=utf-8' } });
  }

  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode(first.value));
    },
    async pull(controller) {
      try {
        const next = await generator.next();
        if (next.done) {
          closed = true;
          controller.close();
          return;
        }
        controller.enqueue(encoder.encode(next.value));
      } catch {
        // The upstream failed after the answer had already started.
        try {
          controller.enqueue(encoder.encode(CUT_OFF));
        } catch {
          // The stream was already closed or cancelled.
        }
        closed = true;
        controller.close();
      }
    },
    async cancel() {
      closed = true;
      await generator.return(undefined).catch(() => {});
    }
  });

  const onAbort = () => {
    if (closed) return;
    closed = true;
    void generator.return(undefined).catch(() => {});
  };
  if (request.signal.aborted) {
    onAbort();
  } else {
    request.signal.addEventListener('abort', onAbort, { once: true });
  }

  return new Response(stream, {
    headers: { 'content-type': 'text/plain; charset=utf-8' }
  });
}

export const POST = (event: RequestEvent) => _handleChat(event, { streamChat, limiters });

export const config = { maxDuration: 60 };

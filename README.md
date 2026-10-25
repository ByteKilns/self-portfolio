# Nirjal Prajapati — Portfolio

A personal portfolio for Nirjal Prajapati, built with SvelteKit (Svelte 5, Vite, Tailwind CSS) and deployed on Vercel. The home page is prerendered to static HTML and served from Vercel's CDN. The only server route is [`src/routes/api/chat/+server.ts`](src/routes/api/chat/+server.ts): it puts the whole CV and project list into the system prompt and streams Gemini's answer back as plain text — no RAG, no embeddings, no database.

## Development

```bash
bun install
bun run dev       # http://localhost:5173
bun run test      # Vitest (also checks that static/ files stay under 300 KB)
bun run check     # svelte-kit sync + svelte-check
bun run build     # production build + .vercel/output
bun run preview   # preview the production build
bun run format    # Prettier
```

## Environment variables

Copy `.env.example` to `.env` for local development:

```bash
GEMINI_API_KEY=your-key-here
GEMINI_MODEL=gemini-3.5-flash-lite
```

- `GEMINI_API_KEY` is required — the chat returns `503` without it.
- `GEMINI_MODEL` is optional; it defaults to `gemini-3.5-flash-lite`.

They are read through `$env/dynamic/private`, so they are never exposed to the browser. For production, set both in **Vercel → Project → Settings → Environment Variables** (Production and Preview).

## Editing the chat's knowledge

The assistant only knows what is in these two files:

- **CV:** `src/lib/server/cv.md` — the entire file is injected into the system prompt. Keep facts accurate; the bot is instructed not to invent anything.
- **Projects:** `src/lib/data/project-data.ts` — each project's title, description, tech stack and links are appended to the prompt.

The prompt itself lives in `src/lib/server/chat/prompt.ts`. Rate limits (10 requests/minute, 60/day per IP) and request validation are in `src/lib/server/chat/`.

## Images

Convert new images to WebP with:

```bash
node scripts/optimize-images.mjs <input> [output] [--width N] [--quality N] [--lossless]
```

Examples:

```bash
node scripts/optimize-images.mjs static/new-photo.png static/new-photo.webp --width 1600 --quality 60
node scripts/optimize-images.mjs src/lib/assets/logo.png src/lib/assets/logo.webp --lossless
```

No file in `static/` may exceed **300 KB**; `bun run test` enforces this.

## Deploying

Push to GitHub — Vercel builds automatically from `main`, and every pull request gets its own preview URL. The project uses `@sveltejs/adapter-vercel` with the Node.js 22 runtime, and `/api/chat` sets `maxDuration = 60` so long streamed answers are not cut off.

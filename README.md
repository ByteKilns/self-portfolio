# Nirjal Prajapati — Portfolio

A personal portfolio for Nirjal Prajapati, built with SvelteKit (Svelte 5, Vite) and deployed on Vercel. The home page is prerendered to static HTML and served from Vercel's CDN. Site copy and projects live in [`src/lib/data/content.json`](src/lib/data/content.json) and are edited through a dev-only CMS at `/cms`. The only server route in production is [`src/routes/api/chat/+server.ts`](src/routes/api/chat/+server.ts): it puts the whole CV and project list into the system prompt and streams Gemini's answer back as plain text — no RAG, no embeddings, no database.

## Development

Requires **Node.js 22 or newer** (SvelteKit 3). With nvm: `nvm use 22`.

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

They are declared in `src/env.ts` and read through `$app/env/private`, so they are never exposed to the browser. For production, set both in **Vercel → Project → Settings → Environment Variables** (Production and Preview).

## Editing the chat's knowledge

The assistant only knows what is in these two files:

- **CV:** `src/lib/server/cv.md` — the entire file is injected into the system prompt. Keep facts accurate; the bot is instructed not to invent anything.
- **Content:** `src/lib/data/content.json` — each project's name, summary, highlights, tech stack and links, plus the site's email, social URLs, tagline and "Currently Working On" list, are appended to the prompt.

## Content and the CMS

Site copy and projects live in `src/lib/data/content.json`. To edit them:

1. Run `bun run dev`.
2. Open <http://localhost:5173/cms> and create the local login on first visit.
3. Edit, then press **Save** (or Ctrl/Cmd+S). Screenshots upload as WebP into `static/projects`.
4. Commit `src/lib/data/content.json` and any new `static/projects/*.webp`, then push to publish.

The CMS and `/api/cms*` are dev-only: they return `404` from `bun run build` + `bun run preview` and in production. The login is a local `localStorage` gate, not real authentication.

The prompt itself lives in `src/lib/server/chat/prompt.ts`. Rate limits (10 requests/minute, 60/day per IP) and request validation are in `src/lib/server/chat/`.

## Images

Upload project screenshots in the CMS; they are resized to at most 1600 px wide and saved as WebP (quality 72, retried at 55 and 40) so each file stays under 300 KB. To convert an image by hand:

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

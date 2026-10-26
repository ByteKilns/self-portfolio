You are implementing a planned redesign in an existing SvelteKit repo. Work autonomously, task by task, and do not stop to ask questions the plan already answers.

## Repo
`C:\Users\nirja\OneDrive\Documents\Personal Projects\my-portfolio`. It uses SvelteKit 3.1, Svelte 5 (runes only), Vite 8, Vitest and TypeScript. Bun is the package manager, and the site is deployed on Vercel.

## Read these first, in full, before writing any code
1. `docs/superpowers/plans/2026-10-26-portfolio-v9-and-bit-cms.md` is THE PLAN. Follow it exactly.
2. `docs/design/Portfolio v9.dc.html` is the source of truth for the public site.
3. `docs/design/Bit CMS.dc.html` is the source of truth for the `/cms` editor.

Ignore every other `Portfolio*.dc.html` file, because they are older drafts. `docs/design/support.js` is only the runtime that renders the design files. Never import it.

## The job
- Port both designs **pixel-perfect** into Svelte.
- Copy every inline style value, `clamp()`, color, transition, keyframe, easing curve, delay and copy string **verbatim**. That includes the curly quotes ’ “ ”, the em dashes, the `[ … ]` text and the arrows.
- Do not convert styles to Tailwind. Tailwind is being removed. Do not "simplify" or round numbers.
- Port the design's JS logic line for line into Svelte 5 runes and TS modules. That logic covers the horizontal scroll stage, the project index, the curtain transition, keyboard shortcuts, the Bit mascot physics and the CMS editor.

## The one visual exception: background
The owner likes the current grainy background, so keep it. Use `/bg/gradient-dark.webp` and `/bg/gradient-light.webp` as a fixed full-viewport layer (cover, center). Do NOT use the design's `--page` radial gradients, its `--grain` SVG noise overlay or its `grain` prop. Keep the existing theme mechanism: the `.dark` class on `<html>`, `localStorage.theme`, and the no-flash script in `src/app.html`.

## Decisions already made (do not revisit)
- **CMS storage:** the CMS is **dev-only**. `/cms` and `/api/cms*` return 404 outside `vite dev`. Save writes `src/lib/data/content.json`, and screenshots go to `static/projects/*.webp` via sharp (≤ 300 KB). The owner commits and pushes to publish. The design's localStorage login is kept as a local gate.
- **Chat:** the console drawer uses the real streaming `/api/chat` via `src/lib/chat/client.ts` `sendChat()`, not the design's canned replies.
- **Fonts:** self-hosted via @fontsource, never Google Fonts.
- **Static files:** every file in `static/` stays ≤ 300 KB, and a test enforces it.

## How to work
- Create the branch `feat/design-v9` from `main`.
- Do Tasks 1→9 in order. For each task:
  1. Write the listed failing tests first and run them to confirm they fail.
  2. Implement.
  3. Run the task's verification commands and confirm the expected output.
  4. Commit with the task's message.
- For any commit you author, end the message with a blank line and then: `Co-Authored-By: DeepSeek <noreply@deepseek.com>`
- **Visual verification is mandatory for Tasks 4, 5, 6 and 8.**
  - Serve the designs with `bunx serve docs/design -l 4000` and the app with `bun run dev`.
  - Compare side by side at 1440×900, 1024×768 and 390×844 in both dark and light.
  - If you can take screenshots (Playwright or similar), capture both and compare them. Otherwise, inspect computed styles element by element.
  - Any difference other than the background is a bug. Fix it before committing.
- Never mark a step done without running its command. If a command fails, debug the root cause. Do not skip, weaken or delete tests to get green.
- If the plan is genuinely ambiguous or contradicts the design file, the **design file wins** for visuals and copy, and the **plan wins** for architecture, data flow and the decisions above. Record each such call in a `DEVIATIONS.md` at the repo root, which goes in the PR description and is not committed.
- SvelteKit 3 moved some module paths. Verify imports such as `dev`, `pushState` and `page` against `node_modules/@sveltejs/kit/types/index.d.ts` instead of guessing.

## Definition of done
- `bun run test`, `bun run check` (0 errors, 0 warnings) and `bun run build` all pass.
- `bun run preview` serves `/` as prerendered HTML and returns 404 for `/cms` and `/api/cms`.
- Every item in the plan's **Review Focus** section has been checked.
- The branch is pushed and a PR is opened (not merged). The PR description lists each task, the visual checks performed, and the contents of `DEVIATIONS.md`. The only expected deviations are the background, real chat, the dynamic footer year, and the CMS storage and upload wording.

## Final report
Reply with:
- the PR link
- per task: the commit hash, the tests added and the verification output (pass/fail counts)
- every deviation and why
- anything you could not verify

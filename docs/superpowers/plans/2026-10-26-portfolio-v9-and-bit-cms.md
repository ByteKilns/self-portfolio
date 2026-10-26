# Portfolio v9 + Bit·CMS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the home page as a pixel-perfect port of `docs/design/Portfolio v9.dc.html`, and add a dev-only `/cms` route that is a pixel-perfect port of `docs/design/Bit CMS.dc.html` and writes `src/lib/data/content.json`. The only visual exception is the page background: keep the current grainy WebP background.

**Architecture:** One JSON file (`src/lib/data/content.json`) holds all site content. The prerendered home page and `/api/chat` import it at build time. `/cms` and `/api/cms/*` exist only under `vite dev`: Save writes the JSON and screenshots to disk, Vite reloads the page, and you commit and push to deploy. The design's inline styles are copied verbatim into Svelte markup. Design JS logic (the horizontal-scroll stage, the Bit mascot physics, the CMS editor) is ported line for line into Svelte 5 runes and plain TS modules.

**Tech Stack:** SvelteKit 3.1, Svelte 5.57 (runes), Vite 8, Vitest 5, TypeScript 6, sharp, @fontsource. Bun is the package manager. Tailwind and lucide are **removed**.

**Spec:** `docs/design/Portfolio v9.dc.html` (site) and `docs/design/Bit CMS.dc.html` (CMS) are the source of truth for every pixel, string, animation and interaction. Older `Portfolio v*.dc.html` files are history. **Do not read or use them.** `docs/design/support.js` is the Claude Design runtime. Use it only to view the designs, and never import it.

## Global Constraints

- **Pixel-perfect means:** every `style="…"` value in the spec (sizes, `clamp()`s, colors, radii, gaps, paddings, letter-spacing, transitions, keyframes, easing curves, delays, z-indexes) is copied **verbatim**. Do not round values, do not "clean up", and do not convert to Tailwind or other utilities. Every copy string, including the typographic quotes `’ “ ” —`, the `[ … ]` bracket text and the arrows `↗ ↓ → ←`, is copied exactly.
- **Background exception:** do NOT use the design's `--page` radial gradients, the `--grain` SVG noise overlay, or the `grain` prop. Use the current background: a viewport-fixed layer showing `/bg/gradient-dark.webp` (dark) or `/bg/gradient-light.webp` (light) with `background-size: cover; background-position: center`. `html` background-color stays `#030e0e` (dark) and `#edfbff` (light). The `app.html` preload script that preloads the right image stays.
- **Theme mechanism stays as today:** `.dark` class on `<html>`, persisted in `localStorage['theme']`, and the no-flash script in `src/app.html`. Do not adopt the design's `data-theme` attribute. Design tokens map as follows: the design's `:root{…}` (dark) values go under `:root.dark`, and its `[data-theme="light"]{…}` values go under `:root` (light is the base when `.dark` is absent). The `--page`, `--grain`, `--grain-op` and `--grain-blend` tokens are omitted.
- **Tailwind is removed.** Its preflight changes `a`, `h1–h3`, `fieldset`, `button` and `img` defaults that the design relies on (underlined links, for example). Remove `tailwindcss`, `@tailwindcss/vite` and `lucide-svelte`.
- **Fonts are self-hosted via @fontsource** and never loaded from Google Fonts:
  - Site: `@fontsource/space-grotesk` 400/500/600 and `@fontsource/space-mono` 400.
  - CMS only: `@fontsource/vt323` 400 and `@fontsource/ibm-plex-mono` 400/500/600.
  - Font-family strings stay as in the spec, for example `'Space Grotesk',system-ui,sans-serif`, `'Space Mono',monospace`, `VT323,monospace` and `'IBM Plex Mono',ui-monospace,monospace`.
- **No file in `static/` may exceed 300 KB** (enforced by `src/lib/static-assets.test.ts`). All raster images ship as WebP.
- **Svelte 5 runes only:** `$state`, `$derived`, `$effect`, `$props` and `{@attach}`/`bind:this`. No `svelte/store`, no `on:` directives (use `onclick`), and no `export let`.
- **Inline-style porting rules:**
  - `{{ x }}` inside `style` becomes `{x}`.
  - `style-hover="…"` and `style-active="…"` become a class in the component's `<style>` with `:hover` or `:active` and `!important` on exactly those declarations, because the inline style would otherwise win.
  - `<sc-if value>` becomes `{#if}`, and `<sc-for list as>` becomes `{#each}` keyed by a stable id where one exists.
  - `ref="{{ fooRef }}"` becomes `bind:this={fooEl}`.
- **Chat stays real:** the design's console uses a canned `reply()`. Use the existing streaming `sendChat()` from `src/lib/chat/client.ts` and keep `/api/chat` and its rate limits untouched, except for the data source (Task 2).
- **Respect `prefers-reduced-motion`** exactly as the spec does: the global `@media` rule, plus `reduced` disables the curtain, parallax, wipe and Bit motion.
- Commit after every task. Conventional commit messages. Branch: `feat/design-v9`.

## Review Focus

1. **Light theme:** every component must read tokens. Hard-coded `#04090c` text on accent (hover fills, selection, curtain) is intentional, and that is the only allowed exception. Check every screen in light mode against the spec rendered with `theme: light`.
2. **Narrow viewport (< 820px):** the stage switches to native horizontal scroll with snap, parallax numbers and secondary cards are hidden, the index preview is hidden, and the console is `100vw` wide. Test at 390px. There must be no horizontal page scroll (`overflow-x: clip` on the root).
3. **Content edge cases in content.json:** 0 featured projects, a project with no image, no url, no points, an empty `now` list, or a name with one word (`mono()`) must render the spec's placeholders (`[ Write-up coming soon ]`, `[ Link not available currently ]`, the tinted monogram tile) and must never crash. These are covered by `format.test.ts` and `content.test.ts`.
4. **CMS in production:** `/cms`, `/api/cms` and `/api/cms/image` must return 404 in `vite build` + `vite preview`. This is covered by the guard test in Task 6 and the manual check in Task 9.
5. **Bit perch math on resize and scroll:** perches recompute every frame. Bit must never sit off-screen or above the header (`y - H < 64` rejection) after a resize from 1440 to 390.

---

## File Structure

```
src/app.css                                  REWRITE  global base + tokens + keyframes (from spec <helmet>)
src/app.html                                 KEEP     theme/preload script unchanged; <title> from spec
src/routes/+layout.svelte                    MODIFY   fonts + app.css only
src/routes/+page.svelte                      REWRITE  composes site components, owns view state
src/routes/+page.ts                          KEEP     prerender = true
src/routes/cms/+page.svelte                  CREATE   Bit·CMS UI
src/routes/cms/+page.ts                      CREATE   ssr=false, prerender=false, 404 unless dev
src/routes/api/cms/+server.ts                CREATE   GET/PUT content.json (dev only)
src/routes/api/cms/image/+server.ts          CREATE   POST screenshot -> static/projects/<slug>.webp (dev only)
src/routes/api/chat/+server.ts               MODIFY   read projects from content
src/lib/content/types.ts                     CREATE   Content, Site, Project
src/lib/content/index.ts                     CREATE   content, liveProjects(), featured()
src/lib/content/validate.ts                  CREATE   validateContent()
src/lib/content/format.ts                    CREATE   pad, mono, slug, host, parts, tint
src/lib/content/*.test.ts                    CREATE
src/lib/server/cms/guard.ts                  CREATE   devOnly() helper
src/lib/server/cms/store.ts                  CREATE   readContent/writeContent/saveImage (fs + sharp)
src/lib/server/cms/*.test.ts                 CREATE
src/lib/data/content.json                    CREATE   seeded content
src/lib/data/project-data.ts                 DELETE
src/lib/types.ts                             MODIFY   drop Project/Box/Chat (keep nothing used)
src/lib/server/chat/prompt.ts(+test)         MODIFY   new Project shape
src/lib/static-assets.test.ts                MODIFY   check content.json image paths
src/lib/components/site/Header.svelte        CREATE
src/lib/components/site/NowPopover.svelte    CREATE
src/lib/components/site/Hero.svelte          CREATE
src/lib/components/site/WorkStage.svelte     CREATE   sticky horizontal scroll stage
src/lib/components/site/ProjectIndex.svelte  CREATE   searchable archive + preview
src/lib/components/site/Contact.svelte       CREATE
src/lib/components/site/ProjectView.svelte   CREATE
src/lib/components/site/Curtain.svelte       CREATE
src/lib/components/site/ConsoleDrawer.svelte CREATE   real streaming chat
src/lib/components/site/Bit.svelte           CREATE   mascot markup + rAF loop
src/lib/components/site/bit-engine.ts        CREATE   ported updateBit/perches/poke math
src/lib/components/site/PageBackground.svelte CREATE  fixed grainy webp layer
src/lib/components/{ChatComponent,ConsoleComponent,ConsoleContent,HeroContent,Navbar,ProjectGrid,ProjectsModal,WorkingOnModal,WorkingOnModalContent}/  DELETE
static/avatar-dark.webp, static/avatar-light.webp, static/projects/aastha.webp   CREATE (from docs/design/assets)
static/modal-dark-bg.webp, static/placeholder.webp, src/lib/assets/vector.webp   DELETE if unreferenced
```

Shared view state lives in `+page.svelte` and is passed down as props and callbacks. There is no global store.

---

### Task 1: Content model, helpers and seed data

**Files:**
- Create: `src/lib/content/types.ts`, `src/lib/content/format.ts`, `src/lib/content/validate.ts`, `src/lib/content/index.ts`, `src/lib/data/content.json`
- Test: `src/lib/content/format.test.ts`, `src/lib/content/content.test.ts`

**Interfaces:**
- Produces:
  ```ts
  // types.ts
  export interface Project { id: string; name: string; summary: string; points: string[]; stack: string[];
    url: string; year: string; role: string; client: string; image: string; hue: number; featured: boolean; draft: boolean }
  export interface Site { email: string; github: string; linkedin: string; tagline: string; now: string[] }
  export interface Content { v: 1; site: Site; projects: Project[]; savedAt: number | null }
  // format.ts  (ports of the spec helpers; same behaviour)
  export const pad: (n: number) => string                       // 3 -> "03"
  export const mono: (s: string) => string                      // "Deshna IT" -> "DI", "" -> "?"
  export const slug: (s: string) => string                      // "IBM Nepal" -> "ibm-nepal"
  export const host: (u: string) => string                      // "https://www.x.com/a" -> "x.com", bad -> ""
  export const parts: (s: string) => { t: string; b: boolean }[] // "a **b** c" -> [{t:"a ",b:false},{t:"b",b:true},{t:" c",b:false}]
  export const tint: (hue: number, dark: boolean) => string     // exact oklch gradients from spec renderVals()
  // validate.ts
  export function validateContent(x: unknown): Content          // throws Error('invalid content: <reason>'); fills missing optional fields with defaults like the CMS `P()` factory
  // index.ts
  export const content: Content                                  // validateContent(imported json)
  export function liveProjects(c?: Content): Project[]           // !draft && name.trim() !== ''
  export function featured(list: Project[]): (Project & { idx: number })[]
  ```

- [ ] **Step 1: Write failing tests**
  - In `format.test.ts`, write tests for each example in the comments above. Add these cases:
    - `mono('Aastha Saving and Cooperative Limited') === 'AS'`
    - `tint(185, true) === 'linear-gradient(135deg,oklch(0.42 0.08 185),oklch(0.17 0.035 185) 78%)'`
    - `tint(185, false) === 'linear-gradient(135deg,oklch(0.86 0.07 185),oklch(0.97 0.02 185) 78%)'`
    - `parts('')` deep-equals `[]`
  - In `content.test.ts`, write these tests:
    - `validateContent` rejects a non-object, a missing `projects` array, and a project without a string `name`.
    - It fills `points: []`, `stack: []`, `hue: 185`, `featured: false`, `draft: false` when they are missing.
    - `liveProjects` drops drafts and blank names.
    - The seeded `content` has 7 projects, exactly 3 of them featured, in this order: Aastha, Deshna IT, IBM Nepal.

- [ ] **Step 2: Run** `bun run test src/lib/content`. Expected: FAIL (modules missing).

- [ ] **Step 3: Implement** the four modules. Port `pad`, `mono`, `slug`, `host` and `parts` from the spec's script block. Use the CMS version of `mono` (`(s || '?').trim()…`).

- [ ] **Step 4: Create `content.json`** by merging `src/lib/data/project-data.ts` (real copy) with the spec's `PROJECTS` (summary, hue, featured).
  - **Order and hues:** Aastha 185 ★, Deshna IT 205 ★, IBM Nepal 230 ★, Nepal Police Digital Diary 165, Niva Craftworks 190, Everest Ledger 250, Husky App 175.
  - **Field mapping:**
    - `title` becomes `name`.
    - `description` becomes `points`.
    - `TechStack` becomes `stack`.
    - `url` is `websitelink` when `isLinkAvailable`, otherwise `''`.
    - `image` is `'/projects/aastha.webp'` for Aastha and `''` for every other project. Placeholder.webp goes away.
  - **Summary:** Aastha uses the spec's summary. Every other project uses `''`.
  - **Other fields:** `year`, `role` and `client` are `''`. `id` is `slug(name)`.
  - **site:**
    - `email: 'nirjalprajapati@gmail.com'`
    - `github: 'https://github.com/nirjalpraj'`
    - `linkedin: 'https://www.linkedin.com/in/nirjal-prajapati-b343a11a5/'`
    - `tagline` and `now` copied verbatim from the spec's `SITE`
  - `savedAt: null`, `v: 1`. Pretty-print with 2 spaces.

- [ ] **Step 5: Run** `bun run test src/lib/content`. Expected: PASS.

- [ ] **Step 6: Commit** with `feat(content): JSON content model, helpers and seed`.

### Task 2: Switch chat + asset test to content.json, drop old data

**Files:**
- Modify: `src/lib/server/chat/prompt.ts`, `src/lib/server/chat/prompt.test.ts`, `src/routes/api/chat/+server.ts`, `src/lib/static-assets.test.ts`, `src/lib/types.ts`
- Delete: `src/lib/data/project-data.ts`

**Interfaces:**
- Consumes: `Project` and `liveProjects()` from Task 1.
- Produces: `buildMessages({ cv, projects: Project[], history, message, today })` with the same signature and the new `Project` type.

- [ ] **Step 1: Update `prompt.test.ts`** fixtures to the new shape.
  - Assert that a project block renders `## <name>`, then `- <point>` lines, then `Tech: a, b`, then `Live: <url>`, but only when `url !== ''`.
  - Add a case: a project with `summary` renders the summary line directly under the heading.

- [ ] **Step 2: Run** `bun run test src/lib/server/chat`. Expected: FAIL.

- [ ] **Step 3: Update `prompt.ts`** to the new fields. The summary line, when non-empty, goes after the heading. Update `+server.ts` to pass `liveProjects()`.

- [ ] **Step 4: Update `static-assets.test.ts`**: every non-empty `project.image` in `content.json` must start with `/` and exist under `static/`. Delete `project-data.ts`. Reduce `types.ts` to whatever is still imported, or delete it if nothing is.

- [ ] **Step 5: Run** `bun run test && bun run check`. Expected: all PASS and 0 errors. The old components may still import deleted types, so delete `src/lib/components/*` now and stub `+page.svelte` to `<h1>wip</h1>` so check passes.

- [ ] **Step 6: Commit** with `refactor(chat): read projects from content.json`.

### Task 3: Global shell: tokens, fonts, background, assets; remove Tailwind

**Files:**
- Rewrite: `src/app.css`
- Modify: `src/routes/+layout.svelte`, `src/app.html` (title and meta description only), `vite.config.ts`, `package.json`
- Create: `src/lib/components/site/PageBackground.svelte`, `static/avatar-dark.webp`, `static/avatar-light.webp`, `static/projects/aastha.webp`

- [ ] **Step 1: Update dependencies.** Run:
  ```
  bun remove tailwindcss @tailwindcss/vite lucide-svelte
  bun add @fontsource/space-mono @fontsource/vt323 @fontsource/ibm-plex-mono
  ```
  Remove `tailwindcss()` from `vite.config.ts`.

- [ ] **Step 2: Rewrite `app.css`** from the spec `<helmet><style>`, lines 18–40 of `Portfolio v9.dc.html`, with these changes:
  - Tokens are remapped per Global Constraints (light on `:root`, dark on `:root.dark`).
  - The `--page` and `--grain*` tokens are dropped.
  - `html,body{margin:0}`. The html background colors are `#edfbff` and `html.dark{#030e0e}`.
  - Keep every `@keyframes` and the reduced-motion rule verbatim.
  - Add `html{color-scheme:light} html.dark{color-scheme:dark}`.

- [ ] **Step 3: Update `+layout.svelte`** to import `../app.css`, `@fontsource/space-grotesk/{400,500,600}.css` and `@fontsource/space-mono/400.css`. Then update `app.html`:
  - Set `<title>` to `Nirjal Prajapati — Full Stack Developer`.
  - Add the meta description from the spec.
  - Keep the theme script byte-for-byte.

- [ ] **Step 4: Create `PageBackground.svelte`**: `<div aria-hidden="true" class="bg">`.
  - The `.bg` style is `position:fixed;inset:0;z-index:0;pointer-events:none;background:url(/bg/gradient-light.webp) center/cover no-repeat`, with `:global(html.dark) .bg{background-image:url(/bg/gradient-dark.webp)}`.
  - This reproduces today's look per viewport on a long page. Use a fixed layer, not `background-attachment:fixed`, because that breaks on iOS.

- [ ] **Step 5: Convert the images** to WebP:
  ```
  node scripts/optimize-images.mjs docs/design/assets/avatar-dark.png static/avatar-dark.webp --width 600 --quality 80
  node scripts/optimize-images.mjs docs/design/assets/avatar-light.png static/avatar-light.webp --width 600 --quality 80
  node scripts/optimize-images.mjs docs/design/assets/project-aastha.png static/projects/aastha.webp --width 1600 --quality 70
  ```
  Delete `static/placeholder.webp`, `static/modal-dark-bg.webp` and `src/lib/assets/vector.webp` once `grep -r` shows nothing references them.

- [ ] **Step 6: Run** `bun run test && bun run check && bun run build`. Expected: PASS, 0 errors, build OK.

- [ ] **Step 7: Commit** with `chore(ui): design tokens, self-hosted fonts, keep grainy bg, drop tailwind`.

### Task 4: Header, Now popover, Hero, Contact, Console drawer, Curtain, ProjectView

All markup is ported from `Portfolio v9.dc.html`; line numbers refer to that file. `+page.svelte` owns this state, mirroring the spec's `state`:

```ts
let project = $state<number | null>(null);
let consoleOpen = $state(false);
let nowOpen = $state(false);
let curtain = $state<string | null>(null);
let narrow = $state(false);
let reduced = $state(false);
let isDark = $state(false);
```

**Files:** create the 7 components listed in the File Structure (except WorkStage, ProjectIndex and Bit) and rewrite `+page.svelte`.

**Interfaces (props):**
- `Header { isDark, nowItems: {t:string,b:boolean}[][], nowOpen, onHome, onWork, onContact, onToggleNow, onCloseNow, onToggleTheme, onToggleConsole }`. Spec lines 44–71. The Now popover is lines 51–59.
- `Hero { site: Site, isDark, onToggleConsole }`. Lines 74–89. The avatar src is `/avatar-dark.webp` or `/avatar-light.webp`. The `<span data-perch="side" data-say="hi! I’m Bit.">` attributes must survive, because Bit reads them.
- `Contact { site: Site, onToggleConsole, bind:contactEl, bind:emailEl, bind:floorEl, onLure(on:boolean), onCursor(on:boolean) }`. Lines 218–244. The footer year is `© {new Date().getFullYear()} Nirjal Prajapati`.
- `ProjectView { project: Project, index: number, total: number, prevName, nextName, isDark, onBack, onPrev, onNext }`. Lines 247–279. `meta` is built from year, role and client exactly as at lines 724–726.
- `Curtain { text: string }`. Lines 281–285.
- `ConsoleDrawer { open, onClose }`. Lines 287–308, with this behavior:
  - Messages start with the spec's greeting.
  - `send(text)` appends the user turn and sets `typing = true`. It then calls `sendChat({ message, history, onChunk })`, which streams into a new bot message. The first chunk clears `typing`.
  - On error, it appends a bot message with `err.message`.
  - Suggestions are `['skills','projects','experience','contact']`.
  - Focus the input 60 ms after opening, and auto-scroll the log on change.
  - If the existing deleted `ChatComponent.svelte` had history-length limits, take them from git (`git show HEAD:src/lib/components/ChatComponent/ChatComponent.svelte`).

**Page-level behaviour** (port from `componentDidMount`, `open`, `back`, `step`, `jump` and `openWithCurtain`):
- **Keys:**
  - `Escape` closes, in this priority: Now popover, then console, then project.
  - `g`/`G` toggles the console when focus is not in an input and no modifier key is held.
  - `ArrowLeft`/`ArrowRight` step through projects while a project is open and the console is closed.
- **Curtain timing:** `openWithCurtain` waits 440 ms, then opens, then clears the curtain after 560 ms. It is skipped when `reduced`.
- **URL:** opening a project uses SvelteKit shallow routing: `pushState('', { project: i })` from `$app/navigation`. Read `page.state.project` from `$app/state`, so the browser/phone Back button returns to the page. `back()` calls `history.back()` when the state came from pushState, and otherwise sets `project = null`. Restore the scroll Y like the spec.
- **Viewport flags:** `narrow = innerWidth < 820`, updated on resize. `reduced = matchMedia('(prefers-reduced-motion: reduce)').matches`.
- **Theme toggle:** toggles `html.dark` and writes `localStorage.theme`, using the same try/catch as the old `+page.svelte`. `isDark` is initialized on mount from the class.
- **Layering:** the root wrapper has `position:relative;z-index:1;min-height:100vh;color:var(--fg);font-family:'Space Grotesk',system-ui,sans-serif;overflow-x:clip`. `<PageBackground/>` is rendered before it.

- [ ] **Step 1: Build the components.** Port each component and wire it into `+page.svelte`. Use placeholders `<section bind:this={workEl}>WORK</section>` and `<section bind:this={archiveEl}>INDEX</section>` until Task 5.

- [ ] **Step 2: Run** `bun run check`. Expected: 0 errors, 0 warnings in the new files.

- [ ] **Step 3: Visual check.** Serve the spec with `bunx serve docs/design -l 4000` and open `http://localhost:4000/Portfolio%20v9.dc.html`. Run `bun run dev` beside it.
  - Compare at 1440×900, 1024×768 and 390×844, in dark and light, with the header, hero, Now popover, console, contact, a project view and the curtain open.
  - Expected: identical except the background.
  - Use the Claude Design tweak panel or edit the `data-props` default to switch the spec to light.

- [ ] **Step 4: Commit** with `feat(site): header, hero, contact, console drawer, project view`.

### Task 5: Work stage (sticky horizontal scroll) and Project index

**Files:** Create `WorkStage.svelte` and `ProjectIndex.svelte`. Modify `+page.svelte`.

**Interfaces:**
- `WorkStage { projects: Project[], isDark, narrow, reduced, total: number, onOpen(i:number), onArchive(), bind:workEl }`. Spec lines 91–173 plus `updateWork()` (458–487), `LAYOUT` (388–392) and scene values (695–713).
- `ProjectIndex { projects: Project[], isDark, narrow, reduced, onOpen(i:number), bind:archiveEl, onBitSay(text,ms) }`. Spec lines 176–217 plus `archiveVals`/`archStage` (653–688). `PAGE = 8`.

**Rules:**
- **The frame loop.** `updateWork` runs in a single `requestAnimationFrame` loop owned by WorkStage, and it is cancelled on destroy. It writes styles directly to DOM nodes (`sec.style.height`, `track.style.transform`, progress `scaleX`, the counter text, the `[data-par]` transforms) exactly as in the spec. Do not route per-frame values through `$state`. The only `$state` writes are `seen[i]` (once per scene) and `hover`.
- **Scenes cycle `LAYOUT` A/B/C.** Every `pos`/`narrow` branch from the spec's scene values must be preserved: `numDisp`, `secDisp`, `absPos`, `sceneH`, `stickyPos`, `stickyH`, `trackOverflow`, `trackSnap` and `scrollHint`.
- **The archive preview** remounts its inner stage on each hovered index (`{#key hi}`) so that the `wipe` and `zoomOut` animations replay.
- **Bit reactions.** `onBitSay` fires when the search or tag filter changes: `'hmm… nothing here'` (2000 ms) when the result is empty, and `'found some!'` (1400 ms) when it recovers.

- [ ] **Step 1: Build and wire** both components. Featured scenes come from `featured(liveProjects())`.

- [ ] **Step 2: Run** `bun run check`. Expected: 0 errors.

- [ ] **Step 3: Visual and behaviour check** against the spec at 1440, 1024 and 390:
  - Scrolling pins the stage and moves the track horizontally, and the counter shows `01 / 03` to `03 / 03`.
  - Scenes clip-reveal on first view, and hover expands the points and rotates the arrow.
  - At 390, the stage is native swipe with snap.
  - Searching `zzz` shows `no matches — try another tag or search.`
  - Tag chips filter the list. `[ show all N ↓ ]` appears only when there are more than 8 rows and no filter is active.

- [ ] **Step 4: Commit** with `feat(site): horizontal work stage and searchable project index`.

### Task 6: Bit the mascot

**Files:**
- Create: `src/lib/components/site/bit-engine.ts`, `src/lib/components/site/Bit.svelte`
- Test: `src/lib/components/site/bit-engine.test.ts`

**Interfaces:**
- `bit-engine.ts` exports `createBit(): BitState`, `perches(H: number, vw: number, vh: number, els: Element[]): Perch[]`, `ease(k: number): number` and `step(b: BitState, t: number, env: BitEnv): BitFrame`.
  - `BitFrame` holds every value `updateBit` writes: the wrap transform, the inner scale, bubble bottom, chute opacity and transform, clip, body, sprout, arm and pupil transforms, the eyes lid, happy/mouth/cheek opacities, and the shadow rx/opacity.
  - `BitEnv` = `{ vw, vh, W, narrow, motion, ptr:{x,y}, floorRect: DOMRect|null, emailRect: DOMRect|null, perchEls: Element[], lure: boolean, cursor: boolean, hover: boolean, say(text, ms) }`.
  - The math is ported **verbatim** from spec lines 493–614, with no tuning.
- `Bit.svelte { narrow, reduced, floorEl, emailEl, lure, cursor }`. It renders spec lines 310–363, runs its own rAF loop, applies `BitFrame` via `setAttribute`/`style` on bound elements, and handles poke, hover and hearts (lines 622–631, 740–743). It tracks the pointer with `pointermove` (passive) and idle sleep after 9000 ms.

- [ ] **Step 1: Write failing tests:**
  - `ease(0)===0`, `ease(0.5)===0.5`, `ease(1)===1`.
  - `perches` rejects an element whose rect puts `y - H < 64` and accepts one centered in the viewport.
  - `step` with `motion:false` and no perches places Bit at the corner (`vw - Hp*0.9`, `vh + Hp*0.36`) after its first frame.

- [ ] **Step 2: Run** `bun run test src/lib/components/site`. Expected: FAIL.

- [ ] **Step 3: Implement** `bit-engine.ts` and then `Bit.svelte`. Mount `<Bit>` in `+page.svelte` and pass the Contact refs and lure/cursor flags.

- [ ] **Step 4: Run** the tests, then check. Expected: PASS and 0 errors.

- [ ] **Step 5: Behaviour check** beside the spec. Each of these must behave the same:
  - Bit flies between `data-perch` headings, says each line once, and peeks over the index preview.
  - Bit parachutes onto the contact floor, follows the cursor, and runs to the email when it is hovered (`psst… click it!`).
  - Clicking Bit pops hearts and cycles `BIT_LINES`.
  - After 9 s idle, Bit says `z z z`.
  - With reduced motion, Bit makes no motion.

- [ ] **Step 6: Commit** with `feat(site): Bit mascot`.

### Task 7: Dev-only CMS server: store + guarded API

**Files:**
- Create: `src/lib/server/cms/guard.ts`, `src/lib/server/cms/store.ts`, `src/routes/api/cms/+server.ts`, `src/routes/api/cms/image/+server.ts`
- Test: `src/lib/server/cms/store.test.ts`, `src/lib/server/cms/guard.test.ts`

**Interfaces:**
- `guard.ts`: `devOnly(isDev: boolean): void`. It throws SvelteKit `error(404, 'Not found')` when `!isDev`. Routes call it with `dev` from SvelteKit. Check how SvelteKit 3 exports `dev`: in 2.x it was `$app/environment`. Grep `node_modules/@sveltejs/kit/types/index.d.ts` for `export const dev`.
- `store.ts` (paths are injectable for tests):
  - `readContent(file = CONTENT_PATH): Promise<Content>`
  - `writeContent(c: unknown, file = CONTENT_PATH): Promise<Content>`. It runs `validateContent`, sets `savedAt = Date.now()`, strips `data:` images (throws `invalid content: inline images not allowed`), and writes 2-space JSON plus a newline atomically (temp file, then rename).
  - `saveImage(bytes: Uint8Array, name: string, dir = STATIC_PROJECTS_DIR): Promise<string>`. It uses `sharp` to resize to width ≤ 1600 and saves WebP at quality 72 to `<dir>/<slug(name)>.webp`. If the result is over 300 KB, it retries at quality 55 and then 40, and otherwise throws `image too large`. It returns `/projects/<slug>.webp`.
- **API:**
  - `GET /api/cms` returns `Content`.
  - `PUT /api/cms` with a JSON body returns `{ ok: true, savedAt }`, or `400 { error }` when validation fails.
  - `POST /api/cms/image` takes multipart `file` + `name` and returns `{ path }`, or `400 { error }`.
  - All three call `devOnly(dev)` first.

- [ ] **Step 1: Write failing tests** using a temp dir (`fs.mkdtemp`):
  - `writeContent` then `readContent` round-trips, and `savedAt` is a number.
  - `writeContent({})` rejects.
  - A project with `image: 'data:image/png;base64,AA'` rejects.
  - `saveImage` with a 2400×1500 sharp-generated PNG returns `/projects/test-shot.webp`, and the file is ≤ 300 KB and 1600 px wide.
  - `devOnly(false)` throws with status 404, and `devOnly(true)` does not.

- [ ] **Step 2: Run** the tests. Expected: FAIL.

- [ ] **Step 3: Implement**, then run the tests. Expected: PASS.

- [ ] **Step 4: Commit** with `feat(cms): dev-only content store and API`.

### Task 8: Bit·CMS UI at /cms

**Files:**
- Create: `src/routes/cms/+page.ts`, `src/routes/cms/+page.svelte`. Split it into `src/lib/components/cms/{Login,Toolbar,ProjectList,ProjectEditor,SiteSettings,StatusBar}.svelte` if the page passes ~400 lines.

**Rules:**
- **`+page.ts`:** `export const ssr = false; export const prerender = false;`, and `load` calls `devOnly(dev)`.
- **Markup:** port `Bit CMS.dc.html` lines 24–245 verbatim, with the inline-style rules from Global Constraints.
  - The CMS has its own fixed palette (beige/teal). It ignores the site theme and does **not** render `PageBackground`.
  - Its wrapper sets the dotted teal background from line 24.
  - Import the CMS fonts in this page only.
- **Logic:** port the `Component` class (lines 269–396) to runes, with these differences from the spec:
  - **Load:** initial `projects`/`site`/`savedAt` come from `GET /api/cms`, not localStorage. Show nothing until loaded.
  - **Save** (button and Ctrl/Cmd+S) sends `PUT /api/cms` with `{ v:1, site:{…, now: trimmed non-empty}, projects: projects.map(clean), savedAt }`.
    - On success it sets `dirty=false` and `savedAt`, and flashes `saved. commit content.json to publish.`
    - On error it flashes `error` with kind `err`.
  - **Upload screenshot…** sends the file to `POST /api/cms/image` with `name = cur.name`, then `update('image', path)`. Remove the canvas/dataURL path. Change the hint text under Media to `uploads are saved as WebP in static/projects.`
  - **Reset** asks `confirm('Discard unsaved changes and reload content.json?')`, then re-GETs the content.
  - **Unchanged:** Export, Import, New, Duplicate, Delete, ▲▼, filter, chips (Enter, trailing comma, Backspace), summary counter `/180`, featured counter `/4`, Bit tips priority and colors, and the beforeunload guard when dirty.
  - **Auth:** keep the spec's login exactly (first-run setup, SHA-256 of `user:pass` in `localStorage['nirjal.cms.auth']`, session in session/localStorage). It is a local gate only, since the route never exists in prod.
  - **Links:** "Open site ↗" `href="/"`.
  - **Preview pane:** the image src is the path itself, which is served from static in dev.

- [ ] **Step 1: Build** `/cms`.

- [ ] **Step 2: Run** `bun run check`. Expected: 0 errors.

- [ ] **Step 3: Visual check** against `http://localhost:4000/Bit%20CMS.dc.html` at 1440 and 390, covering the first-run login, the sign-in login with an error, the Projects tab with a selection, an empty filter, the Site settings tab, and the status bar tips.

- [ ] **Step 4: End-to-end check in dev:**
  1. Edit Deshna IT's summary and press Ctrl+S. `git diff src/lib/data/content.json` shows the change, and `http://localhost:5173/` shows it after the reload.
  2. Upload a PNG. `static/projects/deshna-it.webp` exists and is ≤ 300 KB.
  3. Run `git checkout src/lib/data/content.json` and delete that webp afterwards.

- [ ] **Step 5: Commit** with `feat(cms): Bit·CMS editor at /cms (dev only)`.

### Task 9: Final verification and cleanup

- [ ] **Step 1:** Run `grep -rn "tailwind\|lucide\|project-data\|svelte/store" src`. Expected: no matches.
- [ ] **Step 2:** Run `bun run format && bun run test && bun run check && bun run build`. Expected: all pass, 0 errors, 0 warnings.
- [ ] **Step 3:** Run `bun run preview`.
  - `curl -s -o /dev/null -w "%{http_code}" http://localhost:4173/cms` returns `404`.
  - The same `curl` against `/api/cms` returns `404`.
  - `/` returns `200` and is the prerendered HTML.
  - The chat works when `GEMINI_API_KEY` is set.
- [ ] **Step 4:** Do a final side-by-side pass of the whole page against the spec in dark and light at 1440, 1024 and 390. Work through every item in **Review Focus**, and list any intentional deviations in the PR description. The only allowed deviations are the background, real streaming chat, the dynamic footer year, and the CMS storage and upload text.
- [ ] **Step 5:** Update the README sections "Editing the chat's knowledge" and "Images":
  - Projects and site copy now live in `src/lib/data/content.json`, edited via `bun run dev` then `http://localhost:5173/cms`.
  - Commit and push to publish.
- [ ] **Step 6:** Commit with `docs: CMS workflow`. Then push the branch and open a PR. Do not merge.

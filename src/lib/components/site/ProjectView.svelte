<script lang="ts">
  import type { Project } from '#lib/content/types.ts';
  import { mono as monogram, pad, tint as tintOf } from '#lib/content/format.ts';

  let {
    project,
    index,
    total,
    prevName,
    nextName,
    isDark,
    onBack,
    onPrev,
    onNext
  }: {
    project: Project;
    index: number;
    total: number;
    prevName: string;
    nextName: string;
    isDark: boolean;
    onBack: () => void;
    onPrev: () => void;
    onNext: () => void;
  } = $props();

  const num = $derived(pad(index + 1));
  const totalText = $derived(pad(total));
  const hasUrl = $derived(!!project.url);
  const hasImage = $derived(!!project.image);
  const hasSummary = $derived(!!project.summary);
  const hasPoints = $derived(project.points.length > 0);
  const hasMeta = $derived(!!(project.year || project.role || project.client));
  const meta = $derived(
    [
      { k: 'year', v: project.year },
      { k: 'role', v: project.role },
      { k: 'client', v: project.client }
    ].filter((m) => m.v)
  );
  const mono = $derived(monogram(project.name));
  const tint = $derived(tintOf(project.hue, isDark));
</script>

<main
  data-screen-label="Project"
  style="max-width:1600px;margin:0 auto;box-sizing:border-box;padding:clamp(40px,9vh,96px) clamp(20px,6vw,112px) 88px"
>
  <div
    style="display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:22px;font-family:'Space Mono',monospace;font-size:13px;color:var(--fg3);animation:fadeIn .5s ease both"
  >
    <span>work / {num} of {totalText}</span>
    <button
      onclick={onBack}
      style="background:none;border:0;padding:0;cursor:pointer;font:inherit;color:var(--fg2)"
      class="hover-accent">[ esc ] back</button
    >
  </div>
  <div
    style="display:flex;flex-wrap:wrap;align-items:center;gap:14px 28px;margin-bottom:clamp(28px,5vh,48px);animation:riseIn .7s .1s cubic-bezier(.2,.8,.2,1) both"
  >
    <h1
      data-perch="top"
      data-px="0.85"
      data-say="nice pick"
      style="margin:0;font-weight:400;font-size:clamp(30px,3.4vw,58px);letter-spacing:-.03em;line-height:1.02"
    >
      {project.name}
    </h1>
    {#if hasUrl}
      <a
        href={project.url}
        target="_blank"
        rel="noopener"
        style="display:inline-flex;align-items:center;gap:10px;padding:8px 16px;border:1px solid var(--accent);border-radius:999px;text-decoration:none;color:var(--fg);font-size:clamp(15px,1.1vw,18px);white-space:nowrap"
        class="visit-link">visit live site ↗</a
      >
    {:else}
      <span style="font-size:clamp(16px,1.2vw,19px);color:var(--fg2)"
        >[ Link not available currently ]</span
      >
    {/if}
  </div>
  <div
    style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr));gap:clamp(32px,5vw,80px);align-items:start;font-size:clamp(17px,1.3vw,20px);line-height:1.6"
  >
    <div style="animation:riseIn .7s .25s cubic-bezier(.2,.8,.2,1) both">
      {#if hasMeta}
        <div
          style="display:flex;flex-wrap:wrap;gap:8px 24px;margin-bottom:18px;font-family:'Space Mono',monospace;font-size:13px;color:var(--fg3)"
        >
          {#each meta as m, i (i)}<span
              ><span style="color:var(--accent)">{m.k}</span> {m.v}</span
            >{/each}
        </div>
      {/if}
      {#if hasSummary}
        <p style="margin:0 0 26px;color:var(--fg);text-wrap:pretty;max-width:52ch">
          {project.summary}
        </p>
      {/if}
      {#if hasPoints}
        {#each project.points as pt, i (i)}
          <div style="display:grid;grid-template-columns:26px minmax(0,1fr)">
            <span style="color:var(--fg3)">—</span><span>{pt}</span>
          </div>
        {/each}
        <h2
          style="margin:36px 0 14px;font-weight:400;font-size:inherit;text-decoration:underline;text-decoration-thickness:1.5px;text-underline-offset:7px"
        >
          Tech Stack
        </h2>
        <div style="display:flex;flex-wrap:wrap;gap:10px 22px;color:var(--fg2)">
          {#each project.stack as t, i (i)}<span style="white-space:nowrap">[ {t} ]</span>{/each}
        </div>
      {:else}
        <p style="margin:0;color:var(--fg2)">[ Write-up coming soon ]</p>
      {/if}
    </div>
    <div style="animation:wipe 1.1s .2s cubic-bezier(.7,0,.2,1) both">
      {#if hasImage}
        <img
          src={project.image}
          alt={project.name}
          style="width:100%;aspect-ratio:8/5;object-fit:cover;object-position:top;display:block;border-radius:6px;border:1px solid var(--line)"
        />
      {:else}
        <div
          style="width:100%;aspect-ratio:8/5;border-radius:6px;background:{tint};display:flex;align-items:center;justify-content:center;position:relative"
        >
          <span style="font-size:clamp(80px,10vw,170px);letter-spacing:-.06em">{mono}</span>
          <span
            style="position:absolute;left:18px;bottom:14px;font-family:'Space Mono',monospace;font-size:12px;color:var(--fg2)"
            >[ screenshot ]</span
          >
        </div>
      {/if}
    </div>
  </div>
  <div
    style="margin-top:clamp(48px,9vh,96px);padding-top:24px;border-top:1px solid var(--line);display:flex;justify-content:space-between;flex-wrap:wrap;gap:24px;font-size:clamp(17px,1.3vw,20px)"
  >
    <!-- svelte-ignore a11y_invalid_attribute -->
    <a
      href="#"
      onclick={(e) => {
        e.preventDefault();
        onPrev();
      }}
      style="color:var(--fg);text-underline-offset:7px">← {prevName}</a
    >
    <!-- svelte-ignore a11y_invalid_attribute -->
    <a
      href="#"
      onclick={(e) => {
        e.preventDefault();
        onNext();
      }}
      style="color:var(--fg);text-underline-offset:7px">{nextName} →</a
    >
  </div>
</main>

<style>
  .hover-accent:hover {
    color: var(--accent) !important;
  }

  .visit-link:hover {
    background: var(--accent) !important;
    color: #04090c !important;
  }
</style>

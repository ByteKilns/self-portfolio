<script lang="ts">
  import type { Project } from '#lib/content/types.ts';
  import { mono as monogram, pad, tint as tintOf } from '#lib/content/format.ts';

  const PAGE = 8;

  let {
    projects,
    isDark,
    narrow,
    reduced,
    onOpen,
    archiveEl = $bindable(),
    onBitSay
  }: {
    projects: Project[];
    isDark: boolean;
    narrow: boolean;
    reduced: boolean;
    onOpen: (i: number) => void;
    archiveEl?: HTMLElement | null;
    onBitSay: (text: string, ms: number) => void;
  } = $props();

  let q = $state('');
  let tag = $state('All');
  let showAll = $state(false);
  let ah = $state<number | null>(null);
  let previousNoRows: boolean | null = null;

  const tagSet = $derived([
    'All',
    ...(projects.some((p) => p.featured) ? ['Featured'] : []),
    ...Array.from(new Set(projects.flatMap((p) => p.stack || [])))
  ]);
  const all = $derived(projects.map((p, idx) => ({ p, idx })));
  const match = $derived(
    all.filter(
      ({ p }) =>
        (tag === 'All' ||
          (tag === 'Featured' ? p.featured : (p.stack || []).includes(tag))) &&
        (!q || p.name.toLowerCase().includes(q.toLowerCase()))
    )
  );
  const filtering = $derived(tag !== 'All' || !!q);
  const vis = $derived(showAll || filtering ? match : match.slice(0, PAGE));
  const hi = $derived(ah ?? (vis[0] ? vis[0].idx : 0));
  const ap = $derived(projects[hi] || projects[0]);
  const noRows = $derived(match.length === 0);
  const rows = $derived(
    vis.map(({ p, idx }, k) => ({
      idx,
      num: pad(idx + 1),
      name: p.name,
      meta:
        (p.featured ? '★ ' : '') +
        (p.stack && p.stack.length ? p.stack.slice(0, 2).join(' · ') : p.year || 'soon'),
      color: hi === idx && ah != null ? 'var(--accent)' : 'var(--fg)',
      indent: hi === idx && ah != null ? '10px' : '0px',
      arrow: hi === idx && ah != null ? 'rotate(45deg)' : 'none',
      delay: (Math.min(k, 12) * 0.04).toFixed(2) + 's'
    }))
  );
  const expandLabel = $derived(showAll ? '[ show less ↑ ]' : '[ show all ' + match.length + ' ↓ ]');

  function pickTag(label: string) {
    tag = label;
    ah = null;
  }

  function toggleAll() {
    const was = showAll;
    showAll = !was;
    if (was) jumpToArchive();
  }

  function jumpToArchive() {
    if (archiveEl)
      window.scrollTo({
        top: archiveEl.getBoundingClientRect().top + window.scrollY - 10,
        behavior: reduced ? 'auto' : 'smooth'
      });
  }

  $effect(() => {
    const empty = match.length === 0;
    const was = previousNoRows;
    previousNoRows = empty;
    if (was === null) return;
    if (empty) onBitSay('hmm… nothing here', 2000);
    else if (was) onBitSay('found some!', 1400);
  });
</script>

<section
  bind:this={archiveEl}
  data-screen-label="Index"
  aria-label="All projects"
  style="padding-top:clamp(72px,12vh,140px)"
>
  <div
    style="display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:20px 32px;margin-bottom:22px"
  >
    <div style="display:flex;flex-direction:column;gap:10px">
      <span style="font-family:'Space Mono',monospace;font-size:12px;color:var(--fg3)">( index )</span>
      <h2
        data-perch="top"
        data-px="0.3"
        data-say="try the search!"
        style="margin:0;font-weight:400;font-size:clamp(28px,3vw,48px);letter-spacing:-.03em"
      >
        All projects <span
          style="font-family:'Space Mono',monospace;font-size:14px;letter-spacing:0;color:var(--fg3);white-space:nowrap"
          >[ {pad(vis.length)} / {pad(projects.length)} ]</span
        >
      </h2>
    </div>
    <label
      style="display:flex;align-items:center;gap:10px;min-width:min(320px,100%);padding:8px 0;border-bottom:1px solid var(--line);font-family:'Space Mono',monospace;font-size:14px"
    >
      <span style="color:var(--accent)">?</span>
      <input
        bind:value={q}
        placeholder="search projects"
        aria-label="Search projects"
        style="flex:1;min-width:0;background:transparent;border:0;outline:none;font:inherit;color:var(--fg);caret-color:var(--accent)"
      />
    </label>
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:clamp(24px,4vh,40px)">
    {#each tagSet as t (t)}
      <button
        onclick={() => pickTag(t)}
        aria-pressed={tag === t}
        style="white-space:nowrap;padding:6px 12px;border-radius:999px;border:1px solid {tag === t
          ? 'var(--fg)'
          : 'var(--line)'};background:{tag === t
          ? 'var(--fg)'
          : 'transparent'};color:{tag === t
          ? 'var(--ink)'
          : 'var(--fg2)'};font-family:'Space Mono',monospace;font-size:12px;cursor:pointer;transition:background .2s,color .2s"
        >{t}</button
      >
    {/each}
  </div>
  <div
    style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,440px),1fr));gap:clamp(32px,5vw,88px);align-items:start"
  >
    <div role="group" onmouseleave={() => (ah = null)}>
      <div style="border-bottom:1px solid var(--line)">
        {#each rows as r (r.idx)}
          <!-- svelte-ignore a11y_invalid_attribute -->
          <a
            href="#"
            onclick={(e) => {
              e.preventDefault();
              onOpen(r.idx);
            }}
            onmouseenter={() => {
              if (ah !== r.idx) ah = r.idx;
            }}
            onfocus={() => {
              if (ah !== r.idx) ah = r.idx;
            }}
            style="display:grid;grid-template-columns:48px minmax(0,1fr) auto 22px;align-items:baseline;gap:14px;padding:14px 0;border-top:1px solid var(--line);text-decoration:none;color:{r.color};padding-left:{r.indent};transition:padding .3s ease,color .2s;animation:riseIn .5s cubic-bezier(.2,.8,.2,1) both;animation-delay:{r.delay}"
          >
            <span style="font-family:'Space Mono',monospace;font-size:12px;color:var(--fg3)"
              >{r.num}</span
            >
            <span
              style="font-size:clamp(17px,1.35vw,21px);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"
              >{r.name}</span
            >
            <span
              style="font-family:'Space Mono',monospace;font-size:11px;color:var(--fg3);white-space:nowrap"
              >{r.meta}</span
            >
            <span
              style="transition:transform .3s cubic-bezier(.2,.8,.2,1);transform:{r.arrow}">↗</span
            >
          </a>
        {/each}
      </div>
      {#if noRows}
        <p
          style="margin:18px 0 0;font-family:'Space Mono',monospace;font-size:13px;color:var(--fg3)"
        >
          no matches — try another tag or search.
        </p>
      {/if}
      {#if !filtering && match.length > PAGE}
        <button
          onclick={toggleAll}
          style="margin-top:18px;background:none;border:0;padding:0;cursor:pointer;font-family:'Space Mono',monospace;font-size:13px;color:var(--fg2)"
          class="hover-accent">{expandLabel}</button
        >
      {/if}
    </div>
    <div
      style="position:sticky;top:32px;display:{narrow
        ? 'none'
        : 'flex'};flex-direction:column;gap:14px"
    >
      <div
        data-perch="peek"
        data-px="0.8"
        data-say="peek-a-boo"
        style="position:relative;width:100%;aspect-ratio:4/3;border-radius:6px;overflow:hidden;border:1px solid var(--line);background:var(--card)"
      >
        {#if ap}
          {#key hi}
            <div
              style="position:absolute;inset:0;animation:{reduced
                ? 'none'
                : 'wipe .6s cubic-bezier(.7,0,.2,1) both'}"
            >
              {#if ap.image}
                <img
                  src={ap.image}
                  alt={ap.name}
                  style="width:100%;height:100%;object-fit:cover;object-position:top;display:block;animation:zoomOut 1s cubic-bezier(.2,.8,.2,1) both"
                />
              {:else}
                <div
                  style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:{tintOf(
                    ap.hue,
                    isDark
                  )};position:relative"
                >
                  <span
                    style="font-size:clamp(64px,7vw,120px);letter-spacing:-.06em;color:var(--fg)"
                    >{monogram(ap.name)}</span
                  >
                  <span
                    style="position:absolute;left:16px;bottom:14px;font-family:'Space Mono',monospace;font-size:11px;color:var(--fg2)"
                    >[ screenshot ]</span
                  >
                </div>
              {/if}
            </div>
          {/key}
        {/if}
      </div>
      {#if ap}
        <div
          style="display:flex;justify-content:space-between;gap:12px;font-family:'Space Mono',monospace;font-size:12px;color:var(--fg3)"
        >
          <span style="color:var(--accent)">[ {pad(hi + 1)} ] {ap.featured ? '★ featured' : ''}</span
          ><span>{ap.stack ? ap.stack.join(' · ') : ''}</span>
        </div>
        <div style="font-size:16px;line-height:1.55;color:var(--fg2)">
          {ap.summary || '[ Write-up coming soon ]'}
        </div>
      {/if}
    </div>
  </div>
</section>

<style>
  .hover-accent:hover {
    color: var(--accent) !important;
  }
</style>

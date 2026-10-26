<script lang="ts">
  import { pad } from '#lib/content/format.ts';
  import type { Project } from '#lib/content/types.ts';

  let {
    projects,
    sel,
    q,
    onQ,
    onPick
  }: {
    projects: Project[];
    sel: number;
    q: string;
    onQ: (e: Event) => void;
    onPick: (i: number) => void;
  } = $props();

  const rows = $derived(
    projects
      .map((p, i) => ({ p, i }))
      .filter(({ p }) => !q || (p.name || '').toLowerCase().includes(q.toLowerCase()))
      .map(({ p, i }) => {
        const on = i === sel;
        return {
          i,
          num: pad(i + 1),
          name: p.name || 'untitled',
          starTxt: p.featured ? '★' : '·',
          star: on ? '#f4c21b' : p.featured ? '#b07d00' : '#a39c8c',
          status: p.draft ? 'draft' : 'live',
          bg: on ? '#0b5f5a' : 'transparent',
          fg: on ? '#fffdf5' : '#1b1f22'
        };
      })
  );
</script>

<div style="flex:1 1 280px;max-width:400px;min-width:0;display:flex;flex-direction:column;gap:8px">
  <input
    value={q}
    oninput={onQ}
    placeholder="filter projects…"
    aria-label="Filter projects"
    style="width:100%;box-sizing:border-box;padding:7px 9px;font:inherit;font-size:14px;color:#1b1f22;outline:none;background:#fffdf5;border:2px solid;border-color:#77705f #fffef8 #fffef8 #77705f"
  />
  <div
    style="background:#fffdf5;border:2px solid;border-color:#77705f #fffef8 #fffef8 #77705f;max-height:min(68vh,640px);overflow-y:auto"
  >
    <div
      style="display:grid;grid-template-columns:30px 18px minmax(0,1fr) auto;gap:8px;padding:5px 8px;background:#e9e4d7;border-bottom:1px solid #b9b2a2;font-size:11px;color:#5b564b;position:sticky;top:0"
    >
      <span>#</span><span>★</span><span>name</span><span>status</span>
    </div>
    {#each rows as r (r.i)}
      <button
        onclick={() => onPick(r.i)}
        style="display:grid;grid-template-columns:30px 18px minmax(0,1fr) auto;gap:8px;align-items:center;width:100%;padding:7px 8px;border:0;border-bottom:1px dotted #cfc8b8;font:inherit;font-size:13px;text-align:left;cursor:pointer;background:{r.bg};color:{r.fg}"
      >
        <span style="opacity:.7">{r.num}</span>
        <span style="color:{r.star}">{r.starTxt}</span>
        <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{r.name}</span>
        <span
          style="font-size:11px;padding:1px 6px;border:1px solid currentColor;white-space:nowrap"
          >{r.status}</span
        >
      </button>
    {/each}
    {#if rows.length === 0}
      <div style="padding:18px 10px;font-size:13px;color:#5b564b">nothing matches.</div>
    {/if}
  </div>
  <div style="font-size:12px;color:#4a463d">order here = order on the site. ▲▼ to move.</div>
</div>

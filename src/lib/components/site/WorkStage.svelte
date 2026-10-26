<script lang="ts">
  import { onMount } from 'svelte';
  import type { Project } from '#lib/content/types.ts';
  import { host, mono as monogram, pad, slug, tint as tintOf } from '#lib/content/format.ts';

  const LAYOUT = {
    A: {
      num: ['0%', '-4%'],
      vis: ['31%', '6%', '67%', '0deg'],
      sec: ['77%', '60%', '18%', '4deg'],
      txt: ['0%', '24%', '27%']
    },
    B: {
      num: ['64%', '-6%'],
      vis: ['0%', '12%', '57%', '-2deg'],
      sec: ['48%', '0%', '17%', '-5deg'],
      txt: ['64%', '30%', '34%']
    },
    C: {
      num: ['0%', '48%'],
      vis: ['40%', '14%', '55%', '1.5deg'],
      sec: ['10%', '58%', '17%', '3deg'],
      txt: ['0%', '0%', '36%']
    }
  } as const;

  type Feat = Project & { idx: number };

  let {
    projects,
    isDark,
    narrow,
    reduced,
    total,
    onOpen,
    onArchive,
    workEl = $bindable()
  }: {
    projects: Feat[];
    isDark: boolean;
    narrow: boolean;
    reduced: boolean;
    total: number;
    onOpen: (i: number) => void;
    onArchive: () => void;
    workEl?: HTMLElement | null;
  } = $props();

  let trackEl = $state<HTMLDivElement | null>(null);
  let counterEl = $state<HTMLSpanElement | null>(null);
  let progressEl = $state<HTMLSpanElement | null>(null);
  let seen = $state<boolean[]>([]);
  let hover = $state<number | null>(null);

  const fCount = $derived(projects.length);
  const fTotal = $derived(pad(projects.length));
  const moreCount = $derived(total - projects.length);

  const scenes = $derived(
    projects.map((p, i) => {
      const L = LAYOUT['ABC'[i % 3] as 'A' | 'B' | 'C'];
      const isSeen = reduced || !!seen[i];
      const on = hover === i;
      const pos = (v: string) => (narrow ? 'auto' : v);
      return {
        num: pad(i + 1),
        name: p.name,
        image: p.image,
        hasImage: !!p.image,
        noImage: !p.image,
        mono: monogram(p.name),
        tint: tintOf(p.hue, isDark),
        url: host(p.url) || slug(p.name) + '.com',
        file: slug(p.name) + '.md',
        summary: p.summary || '[ Write-up coming soon ]',
        chips: (p.stack || ['write-up soon']).map((label, k) => ({
          label,
          delay: (-k * 0.7 - i * 0.3).toFixed(2) + 's'
        })),
        points: p.points || [],
        rows: on && p.points ? '1fr' : '0fr',
        numL: L.num[0],
        numT: L.num[1],
        visL: pos(L.vis[0]),
        visT: pos(L.vis[1]),
        visW: narrow ? '100%' : L.vis[2],
        visR: narrow ? '0deg' : L.vis[3],
        visS: on ? '1.025' : '1',
        clip: isSeen ? 'inset(0 0 0 0 round 6px)' : 'inset(0 100% 0 0 round 6px)',
        imgS: isSeen ? (on ? '1.06' : '1') : '1.25',
        secL: L.sec[0],
        secT: L.sec[1],
        secW: L.sec[2],
        secR: on ? '0deg' : L.sec[3],
        secOp: isSeen ? '1' : '0',
        secY: isSeen ? (on ? '-10px' : '0px') : '40px',
        txtL: pos(L.txt[0]),
        txtT: pos(L.txt[1]),
        txtW: narrow ? '100%' : L.txt[2],
        txtOp: isSeen ? '1' : '0',
        txtY: isSeen ? '0px' : '30px',
        titleColor: on ? 'var(--accent)' : 'var(--fg)',
        arrow: on ? 'rotate(45deg) translate(2px,-2px)' : 'none',
        enter: () => {
          if (hover !== i) hover = i;
        },
        leave: () => (hover = null),
        open: () => onOpen(p.idx)
      };
    })
  );

  function updateWork() {
    const sec = workEl;
    const track = trackEl;
    if (!sec || !track) return;
    const vw = innerWidth;
    const vh = innerHeight;

    if (!narrow) {
      const need = Math.max(vh, track.scrollWidth - vw + vh);
      if (Math.abs(sec.offsetHeight - need) > 2) sec.style.height = need + 'px';
      const r = sec.getBoundingClientRect();
      const totalH = Math.max(1, sec.offsetHeight - vh);
      const p = Math.min(1, Math.max(0, -r.top / totalH));
      track.style.transform = `translate3d(${-p * Math.max(0, track.scrollWidth - vw)}px,0,0)`;
      if (progressEl) progressEl.style.transform = `scaleX(${p})`;
    } else {
      if (sec.style.height) sec.style.height = '';
      track.style.transform = '';
      const max = track.scrollWidth - track.clientWidth;
      if (progressEl)
        progressEl.style.transform = `scaleX(${max > 0 ? track.scrollLeft / max : 0})`;
    }

    const nodes = track.querySelectorAll('[data-scene]');
    let best = -1;
    let bestD = 1e9;
    let newSeen: boolean[] | null = null;
    nodes.forEach((el, i) => {
      const r = el.getBoundingClientRect();
      const c = (r.left + r.width / 2 - vw / 2) / vw;
      if (Math.abs(c) < bestD && r.top < vh && r.bottom > 0) {
        bestD = Math.abs(c);
        best = i;
      }
      if (!reduced)
        el.querySelectorAll('[data-par]').forEach((n) => {
          const node = n as HTMLElement;
          node.style.transform = `translate3d(${(c * -260 * parseFloat(node.dataset.par || '0')).toFixed(1)}px,0,0)`;
        });
      const r2 = el.getBoundingClientRect();
      if (!seen[i] && r2.left < vw * 0.86 && r2.top < vh * 0.9) {
        newSeen = newSeen || seen.slice();
        newSeen[i] = true;
      }
    });
    if (newSeen) seen = newSeen;

    const label = (best >= 0 && bestD < 0.5 ? pad(best + 1) : '00') + ' / ' + pad(projects.length);
    if (counterEl && counterEl.textContent !== label) counterEl.textContent = label;
  }

  onMount(() => {
    let raf = requestAnimationFrame(function loop() {
      updateWork();
      raf = requestAnimationFrame(loop);
    });
    return () => cancelAnimationFrame(raf);
  });
</script>

<section
  bind:this={workEl}
  data-screen-label="Work"
  aria-label="Selected work"
  style="position:relative"
>
  <div
    style="position:{narrow ? 'relative' : 'sticky'};top:0;height:{narrow
      ? 'auto'
      : '100vh'};overflow:hidden;display:flex;flex-direction:column"
  >
    <div
      style="display:flex;justify-content:space-between;align-items:center;gap:16px;padding:22px clamp(20px,6vw,112px) 0;font-family:'Space Mono',monospace;font-size:12px;color:var(--fg3)"
    >
      <span>( work ) selected projects</span>
      <div style="display:flex;align-items:center;gap:14px">
        <span bind:this={counterEl} style="color:var(--accent)">00 / {fTotal}</span>
        <span
          style="position:relative;width:clamp(80px,12vw,180px);height:1px;background:var(--line);overflow:hidden"
          ><span
            bind:this={progressEl}
            style="position:absolute;inset:0;background:var(--accent);transform:scaleX(0);transform-origin:0 50%"
          ></span></span
        >
      </div>
    </div>
    <div
      bind:this={trackEl}
      style="flex:1;display:flex;align-items:center;gap:clamp(48px,8vw,140px);padding:0 clamp(20px,6vw,112px);overflow-x:{narrow
        ? 'auto'
        : 'visible'};scroll-snap-type:{narrow ? 'x mandatory' : 'none'};will-change:transform"
    >
      <div
        style="flex:none;width:min(560px,80vw);scroll-snap-align:start;display:flex;flex-direction:column;gap:24px"
      >
        <h2
          data-perch="top"
          data-px="0.62"
          data-say="the good stuff →"
          style="margin:0;font-weight:400;font-size:clamp(40px,5.4vw,92px);line-height:.98;letter-spacing:-.035em;text-wrap:balance"
        >
          Featured work.
        </h2>
        <p
          style="margin:0;max-width:36ch;font-size:clamp(17px,1.35vw,21px);line-height:1.6;color:var(--fg2)"
        >
          {fCount} projects get the full stage. Everything else lives in the index below.
        </p>
        <span style="font-family:'Space Mono',monospace;font-size:12px;color:var(--fg3)"
          >{narrow ? 'swipe →' : 'keep scrolling ↓ — the work moves →'}</span
        >
      </div>

      {#each scenes as s, i (i)}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
        <article
          data-scene=""
          onmouseenter={s.enter}
          onmouseleave={s.leave}
          onclick={s.open}
          style="flex:none;position:relative;width:min(1240px,86vw);height:{narrow
            ? 'auto'
            : 'clamp(480px,calc(100vh - 150px),820px)'};display:flex;flex-direction:column;gap:18px;cursor:pointer;scroll-snap-align:center"
        >
          <div
            data-par="-0.4"
            aria-hidden="true"
            style="position:absolute;left:{s.numL};top:{s.numT};display:{narrow
              ? 'none'
              : 'block'};z-index:0;font-size:clamp(160px,24vw,380px);line-height:.8;letter-spacing:-.07em;font-weight:400;color:transparent;-webkit-text-stroke:1px var(--line);pointer-events:none"
          >
            {s.num}
          </div>

          <div
            data-par="0.1"
            data-perch="peek"
            data-px="0.84"
            data-say="ooh, shiny"
            style="position:{narrow
              ? 'relative'
              : 'absolute'};left:{s.visL};top:{s.visT};width:{s.visW};z-index:1"
          >
            <div
              style="transform:rotate({s.visR}) scale({s.visS});transition:transform .7s cubic-bezier(.2,.8,.2,1)"
            >
              <div
                style="clip-path:{s.clip};transition:clip-path 1.2s cubic-bezier(.7,0,.2,1);border-radius:6px;overflow:hidden;box-shadow:var(--shadow);border:1px solid var(--line)"
              >
                <div
                  style="display:flex;align-items:center;gap:6px;padding:9px 12px;background:var(--surface);border-bottom:1px solid var(--line)"
                >
                  <span
                    style="width:8px;height:8px;border-radius:50%;background:var(--fg3);opacity:.6"
                  ></span><span
                    style="width:8px;height:8px;border-radius:50%;background:var(--fg3);opacity:.6"
                  ></span><span
                    style="width:8px;height:8px;border-radius:50%;background:var(--fg3);opacity:.6"
                  ></span>
                  <span
                    style="margin-left:10px;font-family:'Space Mono',monospace;font-size:11px;color:var(--fg3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis"
                    >{s.url}</span
                  >
                </div>
                {#if s.hasImage}
                  <img
                    src={s.image}
                    alt="{s.name} screenshot"
                    style="width:100%;aspect-ratio:16/10;object-fit:cover;object-position:top;display:block;transform:scale({s.imgS});transition:transform 1.4s cubic-bezier(.2,.8,.2,1)"
                  />
                {:else}
                  <div
                    style="width:100%;aspect-ratio:16/10;background:{s.tint};position:relative;display:flex;align-items:center;justify-content:center"
                  >
                    <span
                      style="font-size:clamp(64px,9vw,150px);letter-spacing:-.06em;color:var(--fg);opacity:.92"
                      >{s.mono}</span
                    >
                    <span
                      style="position:absolute;left:16px;bottom:14px;font-family:'Space Mono',monospace;font-size:11px;color:var(--fg2)"
                      >[ screenshot ]</span
                    >
                  </div>
                {/if}
              </div>
            </div>
          </div>

          <div
            data-par="0.32"
            style="position:{narrow
              ? 'relative'
              : 'absolute'};left:{s.secL};top:{s.secT};width:{s.secW};display:{narrow
              ? 'none'
              : 'block'};z-index:3"
          >
            <div
              style="opacity:{s.secOp};transform:rotate({s.secR}) translateY({s.secY});transition:opacity .8s ease .35s,transform 1s cubic-bezier(.2,.8,.2,1) .35s"
            >
              {#if s.hasImage}
                <div
                  style="border-radius:14px;overflow:hidden;border:4px solid var(--surface);box-shadow:var(--shadow);aspect-ratio:9/16;max-height:46vh"
                >
                  <img
                    src={s.image}
                    alt=""
                    style="width:100%;height:100%;object-fit:cover;object-position:78% 40%;display:block;transform:scale(1.9)"
                  />
                </div>
              {:else}
                <div
                  style="padding:16px 18px;border-radius:6px;background:var(--surface);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid var(--line);box-shadow:var(--shadow);font-family:'Space Mono',monospace;font-size:12px;line-height:1.9;color:var(--fg2)"
                >
                  <div style="color:var(--fg3)">$ cat {s.file}</div>
                  <div><span style="color:var(--accent)">project</span> {s.num}</div>
                  <div><span style="color:var(--accent)">notes</span> write-up soon</div>
                </div>
              {/if}
            </div>
          </div>

          <div
            style="position:{narrow
              ? 'relative'
              : 'absolute'};left:{s.txtL};top:{s.txtT};width:{s.txtW};z-index:2;display:flex;flex-direction:column;gap:14px;opacity:{s.txtOp};transform:translateY({s.txtY});transition:opacity .8s ease .15s,transform 1s cubic-bezier(.2,.8,.2,1) .15s"
          >
            <span style="font-family:'Space Mono',monospace;font-size:12px;color:var(--fg3)"
              >[ {s.num} / {fTotal} ] featured</span
            >
            <h3
              style="margin:0;font-weight:400;font-size:clamp(28px,3vw,52px);line-height:1.02;letter-spacing:-.03em;text-wrap:balance;color:{s.titleColor};transition:color .3s"
            >
              {s.name}
            </h3>
            <p
              style="margin:0;font-size:clamp(16px,1.2vw,19px);line-height:1.55;color:var(--fg2);text-wrap:pretty"
            >
              {s.summary}
            </p>
            <div style="display:flex;flex-wrap:wrap;gap:8px">
              {#each s.chips as c, k (k)}<span
                  style="white-space:nowrap;padding:5px 10px;border:1px solid var(--line);border-radius:999px;font-family:'Space Mono',monospace;font-size:11px;color:var(--fg2);animation:float 4.5s ease-in-out infinite;animation-delay:{c.delay}"
                  >{c.label}</span
                >{/each}
            </div>
            <div
              style="display:grid;grid-template-rows:{s.rows};transition:grid-template-rows .5s cubic-bezier(.2,.8,.2,1)"
            >
              <div style="overflow:hidden;min-height:0">
                <div
                  style="display:flex;flex-direction:column;gap:4px;padding-top:4px;font-size:15px;line-height:1.5;color:var(--fg2)"
                >
                  {#each s.points as pt, k (k)}<div
                      style="display:grid;grid-template-columns:20px minmax(0,1fr)"
                    >
                      <span style="color:var(--accent)">+</span><span>{pt}</span>
                    </div>{/each}
                </div>
              </div>
            </div>
            <span style="display:flex;align-items:center;gap:10px;font-size:16px;color:var(--fg)"
              ><span
                style="text-decoration:underline;text-underline-offset:6px;text-decoration-thickness:1.5px"
                >open project</span
              ><span
                style="display:inline-block;transition:transform .35s cubic-bezier(.2,.8,.2,1);transform:{s.arrow}"
                >↗</span
              ></span
            >
          </div>
        </article>
      {/each}

      <div
        style="flex:none;width:min(520px,80vw);scroll-snap-align:center;display:flex;flex-direction:column;gap:22px;padding-right:clamp(20px,6vw,112px)"
      >
        <span style="font-family:'Space Mono',monospace;font-size:12px;color:var(--fg3)"
          >[ + {moreCount} more ]</span
        >
        <h2
          data-perch="top"
          data-px="0.5"
          data-say="there’s more ↓"
          style="margin:0;font-weight:400;font-size:clamp(36px,4.4vw,76px);line-height:1;letter-spacing:-.035em;text-wrap:balance"
        >
          The rest live in the index.
        </h2>
        <!-- svelte-ignore a11y_invalid_attribute -->
        <a
          href="#"
          onclick={(e) => {
            e.preventDefault();
            onArchive();
          }}
          style="align-self:flex-start;font-size:18px;color:var(--fg);text-underline-offset:6px"
          class="hover-accent">Browse all {pad(total)} projects ↓</a
        >
      </div>
    </div>
  </div>
</section>

<style>
  .hover-accent:hover {
    color: var(--accent) !important;
  }
</style>

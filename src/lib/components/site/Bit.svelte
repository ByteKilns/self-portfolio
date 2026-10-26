<script lang="ts">
  import { onMount } from 'svelte';
  import { createBit, step, type BitState } from './bit-engine';

  const BIT_LINES = [
    'hi! I’m Bit.',
    'I help Nirjal debug.',
    'boop!',
    'he’s nice — email him!',
    'hehe, that tickles',
    'ship it!'
  ];

  type Heart = { id: number; left: string; dx: string; size: string; delay: string };

  let {
    narrow,
    reduced,
    floorEl,
    emailEl,
    lure,
    cursor
  }: {
    narrow: boolean;
    reduced: boolean;
    floorEl: HTMLElement | null;
    emailEl: HTMLAnchorElement | null;
    lure: boolean;
    cursor: boolean;
  } = $props();

  let mascotEl = $state<HTMLDivElement | null>(null);
  let bubbleEl = $state<HTMLDivElement | null>(null);
  let innerEl = $state<HTMLDivElement | null>(null);
  let chuteEl = $state<HTMLDivElement | null>(null);
  let bitBtnEl = $state<HTMLButtonElement | null>(null);
  let shadowEl = $state<SVGEllipseElement | null>(null);
  let bodyEl = $state<SVGGElement | null>(null);
  let sproutEl = $state<SVGGElement | null>(null);
  let eyesEl = $state<SVGGElement | null>(null);
  let pupilLEl = $state<SVGGElement | null>(null);
  let pupilREl = $state<SVGGElement | null>(null);
  let happyEl = $state<SVGGElement | null>(null);
  let mouthEl = $state<SVGPathElement | null>(null);
  let mouthOEl = $state<SVGGElement | null>(null);
  let armLEl = $state<SVGGElement | null>(null);
  let armREl = $state<SVGGElement | null>(null);
  let cheekLEl = $state<SVGEllipseElement | null>(null);
  let cheekREl = $state<SVGEllipseElement | null>(null);

  let bubble = $state('');
  let hearts = $state<Heart[]>([]);

  const bit: BitState = createBit();
  const ptr = { x: 0, y: 0 };
  let hoverBit = false;
  let lureLocal = false;
  let bubbleTimer: ReturnType<typeof setTimeout> | undefined;
  let heartsTimer: ReturnType<typeof setTimeout> | undefined;
  let lastClip: string | undefined;

  function say(text: string, ms = 1800) {
    if (bubble !== text) bubble = text;
    clearTimeout(bubbleTimer);
    if (ms) bubbleTimer = setTimeout(() => (bubble = ''), ms);
  }

  function poke() {
    const now = performance.now();
    bit.lastMove = now;
    bit.asleep = false;
    bit.happyUntil = now + 1300;
    if (bit.mode === 'ground') {
      if (bit.ground && !reduced) {
        bit.vy = -8.5;
        bit.vx = 0;
        bit.ground = false;
      }
    } else bit.hopT = now;
    say(BIT_LINES[bit.line++ % BIT_LINES.length], 1800);
    const id = now;
    const next = [0, 1, 2].map((k) => ({
      id: id + k,
      left: 30 + k * 20 + '%',
      dx: (k - 1) * 26 + 'px',
      size: 14 + k * 3 + 'px',
      delay: k * 0.08 + 's'
    }));
    hearts = [...hearts, ...next].slice(-9);
    clearTimeout(heartsTimer);
    heartsTimer = setTimeout(() => (hearts = []), 1400);
  }

  function bitHoverOn() {
    hoverBit = true;
    bit.lastMove = performance.now();
    if (!bubble) say('hehe', 1200);
  }

  function bitHoverOff() {
    hoverBit = false;
  }

  $effect(() => {
    lureLocal = lure;
  });

  let wasLure = false;
  $effect(() => {
    if (lure === wasLure) return;
    wasLure = lure;
    if (lure) say('psst… click it!', 0);
    else say('', 1);
  });

  onMount(() => {
    ptr.x = innerWidth / 2;
    ptr.y = innerHeight / 2;
    bit.lastMove = performance.now();

    const onMove = (e: PointerEvent) => {
      ptr.x = e.clientX;
      ptr.y = e.clientY;
      bit.lastMove = performance.now();
    };
    addEventListener('pointermove', onMove, { passive: true });

    const onSay = (e: Event) => {
      const { text, ms } = (e as CustomEvent<{ text: string; ms: number }>).detail;
      say(text, ms);
    };
    addEventListener('bit:say', onSay);

    let raf = 0;
    const loop = (t: number) => {
      const floorRect = floorEl && floorEl.isConnected ? floorEl.getBoundingClientRect() : null;
      const emailRect = emailEl && emailEl.isConnected ? emailEl.getBoundingClientRect() : null;
      const perchEls = Array.from(document.querySelectorAll('[data-perch]'));
      const W = mascotEl?.offsetWidth || 110;
      const env = {
        vw: innerWidth,
        vh: innerHeight,
        W,
        narrow,
        motion: !reduced,
        ptr,
        floorRect,
        emailRect,
        perchEls,
        lure: lureLocal,
        cursor,
        hover: hoverBit,
        say
      };
      const f = step(bit, t, env);
      lureLocal = env.lure;

      if (mascotEl) mascotEl.style.transform = f.wrap;
      if (bubbleEl) bubbleEl.style.bottom = f.bubbleBottom;
      if (innerEl) innerEl.style.transform = f.scale;
      if (chuteEl) {
        chuteEl.style.opacity = f.chuteOpacity;
        chuteEl.style.transform = f.chuteTransform;
      }
      if (bitBtnEl && lastClip !== f.clip) {
        lastClip = f.clip;
        bitBtnEl.style.clipPath = f.clip;
      }
      if (shadowEl) {
        shadowEl.setAttribute('rx', f.shadowRx);
        shadowEl.setAttribute('opacity', f.shadowOpacity);
      }
      if (bodyEl) bodyEl.setAttribute('transform', f.body);
      if (sproutEl) sproutEl.setAttribute('transform', f.sprout);
      if (armLEl) armLEl.setAttribute('transform', f.armL);
      if (armREl) armREl.setAttribute('transform', f.armR);
      if (pupilLEl) pupilLEl.setAttribute('transform', f.pupilL);
      if (pupilREl) pupilREl.setAttribute('transform', f.pupilR);
      if (eyesEl) {
        eyesEl.setAttribute('transform', f.eyes);
        eyesEl.setAttribute('opacity', f.eyesOpacity);
      }
      if (happyEl) happyEl.setAttribute('opacity', f.happy);
      if (mouthEl) mouthEl.setAttribute('opacity', f.mouth);
      if (mouthOEl) mouthOEl.setAttribute('opacity', f.mouthO);
      if (cheekLEl) cheekLEl.setAttribute('opacity', f.cheek);
      if (cheekREl) cheekREl.setAttribute('opacity', f.cheek);

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      removeEventListener('pointermove', onMove);
      removeEventListener('bit:say', onSay);
      cancelAnimationFrame(raf);
      clearTimeout(bubbleTimer);
      clearTimeout(heartsTimer);
    };
  });
</script>

<div
  bind:this={mascotEl}
  style="position:fixed;left:0;top:0;z-index:35;width:clamp(100px,9vw,128px);pointer-events:none;will-change:transform;transform:translate3d(-999px,0,0);transform-origin:50% 100%"
>
  <div bind:this={bubbleEl} style="position:absolute;left:50%;bottom:100%;width:0;height:0">
    {#if bubble}
      <div
        style="position:absolute;left:50%;bottom:0;white-space:nowrap;padding:7px 12px;border-radius:12px;background:var(--fg);color:var(--ink);font-family:'Space Mono',monospace;font-size:12px;animation:bubbleIn .25s cubic-bezier(.2,.9,.3,1.4) both;transform:translateX(-50%);pointer-events:none"
      >
        {bubble}<span
          style="position:absolute;left:50%;top:100%;margin-left:-6px;border:6px solid transparent;border-top-color:var(--fg)"
        ></span>
      </div>
    {/if}
  </div>
  <div bind:this={innerEl} style="position:relative;transform-origin:50% 100%">
    <div
      bind:this={chuteEl}
      aria-hidden="true"
      style="position:absolute;left:-30%;width:160%;bottom:55%;opacity:0;transform-origin:50% 100%;pointer-events:none"
    >
      <svg viewBox="0 0 200 150" width="100%" style="display:block;overflow:visible">
        <g fill="none" stroke-width="1.4" style="stroke:var(--fg3)"
          ><path d="M14 70 L58 150"></path><path d="M72 74 L58 150"></path><path
            d="M128 74 L142 150"
          ></path><path d="M186 70 L142 150"></path></g
        >
        <path
          d="M10 70 C10 26 52 8 100 8 C148 8 190 26 190 70 Q168 59 146 72 Q123 61 100 74 Q77 61 54 72 Q32 59 10 70 Z"
          fill="#f4c21b"
        ></path>
        <path
          d="M100 8 C82 12 72 38 77 66 Q89 63 100 74 Q111 63 123 66 C128 38 118 12 100 8 Z"
          fill="#5fd0c2"
        ></path>
        <path
          d="M40 30 Q60 16 84 13"
          stroke="#fff"
          stroke-width="4"
          stroke-linecap="round"
          fill="none"
          opacity=".5"
        ></path>
      </svg>
    </div>
    {#each hearts as h (h.id)}
      <span
        style="position:absolute;left:{h.left};top:20%;color:#ff8fa8;font-size:{h.size};pointer-events:none;--hx:{h.dx};animation:heartUp 1.1s ease-out both;animation-delay:{h.delay}"
        >♥</span
      >
    {/each}
    <button
      bind:this={bitBtnEl}
      onclick={poke}
      onmouseenter={bitHoverOn}
      onmouseleave={bitHoverOff}
      aria-label="Bit, the mascot. Click to say hi."
      style="display:block;width:100%;pointer-events:auto;background:none;border:0;padding:0;cursor:pointer"
    >
      <svg viewBox="0 0 120 120" width="100%" style="display:block;overflow:visible">
        <defs>
          <linearGradient id="bitBody" x1="0" y1="0" x2="0" y2="1"
            ><stop offset="0" stop-color="#9af3e6"></stop><stop offset="1" stop-color="#34b2a4"
            ></stop></linearGradient
          >
          <linearGradient id="bitLeaf" x1="0" y1="0" x2="1" y2="1"
            ><stop offset="0" stop-color="#c7f59a"></stop><stop offset="1" stop-color="#6fcf7d"
            ></stop></linearGradient
          >
        </defs>
        <ellipse bind:this={shadowEl} cx="60" cy="112" rx="30" ry="5" fill="#000" opacity=".22"
        ></ellipse>
        <g bind:this={bodyEl}>
          <ellipse cx="45" cy="108" rx="10" ry="5.5" fill="#2a9a8d"></ellipse>
          <ellipse cx="75" cy="108" rx="10" ry="5.5" fill="#2a9a8d"></ellipse>
          <g bind:this={armLEl}
            ><ellipse cx="19" cy="80" rx="6.5" ry="10" fill="#4cc4b5"></ellipse></g
          >
          <g bind:this={armREl}
            ><ellipse cx="101" cy="80" rx="6.5" ry="10" fill="#4cc4b5"></ellipse></g
          >
          <g bind:this={sproutEl}>
            <path
              d="M60 36 Q58 24 61 15"
              stroke="#5fbf6e"
              stroke-width="3"
              fill="none"
              stroke-linecap="round"
            ></path>
            <ellipse
              cx="53"
              cy="17"
              rx="8"
              ry="4.5"
              fill="url(#bitLeaf)"
              transform="rotate(-28 53 17)"
            ></ellipse>
            <ellipse
              cx="68"
              cy="13"
              rx="8.5"
              ry="4.8"
              fill="url(#bitLeaf)"
              transform="rotate(24 68 13)"
            ></ellipse>
          </g>
          <rect x="20" y="34" width="80" height="74" rx="37" fill="url(#bitBody)"></rect>
          <ellipse
            cx="42"
            cy="47"
            rx="11"
            ry="5"
            fill="#fff"
            opacity=".38"
            transform="rotate(-22 42 47)"
          ></ellipse>
          <ellipse cx="60" cy="95" rx="22" ry="10" fill="#fff" opacity=".14"></ellipse>
          <ellipse
            bind:this={cheekLEl}
            cx="35"
            cy="80"
            rx="6.5"
            ry="3.8"
            fill="#ff8fa8"
            opacity=".5"
          ></ellipse>
          <ellipse
            bind:this={cheekREl}
            cx="85"
            cy="80"
            rx="6.5"
            ry="3.8"
            fill="#ff8fa8"
            opacity=".5"
          ></ellipse>
          <g bind:this={eyesEl}>
            <ellipse cx="46" cy="66" rx="10" ry="11.5" fill="#fff"></ellipse>
            <ellipse cx="74" cy="66" rx="10" ry="11.5" fill="#fff"></ellipse>
            <g bind:this={pupilLEl}
              ><circle cx="46" cy="67" r="5.8" fill="#10262a"></circle><circle
                cx="48.2"
                cy="64.2"
                r="2"
                fill="#fff"
              ></circle><circle cx="44.2" cy="69.6" r=".9" fill="#fff"></circle></g
            >
            <g bind:this={pupilREl}
              ><circle cx="74" cy="67" r="5.8" fill="#10262a"></circle><circle
                cx="76.2"
                cy="64.2"
                r="2"
                fill="#fff"
              ></circle><circle cx="72.2" cy="69.6" r=".9" fill="#fff"></circle></g
            >
          </g>
          <g
            bind:this={happyEl}
            opacity="0"
            fill="none"
            stroke="#10262a"
            stroke-width="3.2"
            stroke-linecap="round"
            ><path d="M38 68 Q46 58 54 68"></path><path d="M66 68 Q74 58 82 68"></path></g
          >
          <path
            bind:this={mouthEl}
            d="M55 83 Q60 88 65 83"
            fill="none"
            stroke="#10262a"
            stroke-width="2.6"
            stroke-linecap="round"
          ></path>
          <g bind:this={mouthOEl} opacity="0"
            ><ellipse cx="60" cy="85" rx="4.6" ry="4" fill="#10262a"></ellipse><ellipse
              cx="60"
              cy="87"
              rx="2.6"
              ry="1.5"
              fill="#ff8fa8"
            ></ellipse></g
          >
        </g>
      </svg>
    </button>
  </div>
</div>

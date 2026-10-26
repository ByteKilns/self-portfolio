<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/env';
  import { page } from '$app/state';
  import { pushState } from '$app/navigation';
  import { content, featured, liveProjects } from '#lib/content/index.ts';
  import { pad, parts } from '#lib/content/format.ts';
  import PageBackground from '#lib/components/site/PageBackground.svelte';
  import Header from '#lib/components/site/Header.svelte';
  import Hero from '#lib/components/site/Hero.svelte';
  import WorkStage from '#lib/components/site/WorkStage.svelte';
  import ProjectIndex from '#lib/components/site/ProjectIndex.svelte';
  import Contact from '#lib/components/site/Contact.svelte';
  import ProjectView from '#lib/components/site/ProjectView.svelte';
  import Curtain from '#lib/components/site/Curtain.svelte';
  import ConsoleDrawer from '#lib/components/site/ConsoleDrawer.svelte';

  const site = content.site;
  const list = liveProjects();
  const scenes = featured(list);

  let project = $state<number | null>(null);
  let consoleOpen = $state(false);
  let nowOpen = $state(false);
  let curtain = $state<string | null>(null);
  let narrow = $state(false);
  let reduced = $state(false);
  let isDark = $state(false);
  let lure = $state(false);
  let cursor = $state(false);

  let workEl = $state<HTMLElement | null>(null);
  let archiveEl = $state<HTMLElement | null>(null);
  let contactEl = $state<HTMLElement | null>(null);
  let emailEl = $state<HTMLAnchorElement | null>(null);
  let floorEl = $state<HTMLDivElement | null>(null);

  let savedY = 0;
  let lastStateProject: number | undefined = undefined;
  let curtainTimer: ReturnType<typeof setTimeout> | undefined;
  let curtainClearTimer: ReturnType<typeof setTimeout> | undefined;
  let jumpTimer: ReturnType<typeof setTimeout> | undefined;

  const nowItems = $derived(site.now.filter(Boolean).map((line) => parts(line)));
  const cur = $derived(project != null ? (list[project] ?? null) : null);

  function open(i: number) {
    if (project === null) savedY = window.scrollY;
    project = i;
    consoleOpen = false;
    window.scrollTo(0, 0);
    if (browser) void pushState('', { project: i });
  }

  function closeAndRestore() {
    project = null;
    requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo(0, savedY || 0)));
  }

  function back() {
    if (page.state?.project != null) {
      history.back();
      return;
    }
    closeAndRestore();
  }

  function openWithCurtain(i: number) {
    if (reduced) return open(i);
    curtain = list[i].name;
    clearTimeout(curtainTimer);
    clearTimeout(curtainClearTimer);
    curtainTimer = setTimeout(() => {
      open(i);
      curtainClearTimer = setTimeout(() => (curtain = null), 560);
    }, 440);
  }

  function step(d: number) {
    const n = list.length;
    if (n === 0) return;
    project = ((project ?? 0) + d + n) % n;
    window.scrollTo(0, 0);
  }

  function jump(get: () => HTMLElement | null) {
    const go = () => {
      const el = get();
      if (el)
        window.scrollTo({
          top: el.getBoundingClientRect().top + window.scrollY - 10,
          behavior: reduced ? 'auto' : 'smooth'
        });
    };
    if (project !== null) {
      project = null;
      clearTimeout(jumpTimer);
      jumpTimer = setTimeout(go, 60);
    } else go();
  }

  function goHome() {
    project = null;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function toggleTheme() {
    isDark = !isDark;
    document.documentElement.classList.toggle('dark', isDark);
    try {
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    } catch {
      // localStorage can be unavailable (private mode); the theme still applies for this page view.
    }
  }

  function onLure(on: boolean) {
    lure = on;
  }

  function bitSay(text: string, ms: number) {
    if (browser) window.dispatchEvent(new CustomEvent('bit:say', { detail: { text, ms } }));
  }

  $effect(() => {
    const stateProject = page.state?.project;
    const previous = lastStateProject;
    lastStateProject = stateProject;
    if (stateProject === previous) return;
    if (typeof stateProject === 'number') {
      if (project !== stateProject) {
        project = stateProject;
        window.scrollTo(0, 0);
      }
    } else if (project !== null) {
      closeAndRestore();
    }
  });

  onMount(() => {
    isDark = document.documentElement.classList.contains('dark');
    narrow = window.innerWidth < 820;
    reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

    const onKey = (e: KeyboardEvent) => {
      const tag = e.target instanceof HTMLElement ? e.target.tagName : '';
      if (e.key === 'Escape') {
        if (nowOpen) {
          nowOpen = false;
          return;
        }
        if (consoleOpen) {
          consoleOpen = false;
          return;
        }
        if (project != null) back();
        return;
      }
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'g' || e.key === 'G') {
        e.preventDefault();
        consoleOpen = !consoleOpen;
      }
      if (project != null && !consoleOpen) {
        if (e.key === 'ArrowRight') step(1);
        if (e.key === 'ArrowLeft') step(-1);
      }
    };

    const onResize = () => {
      narrow = window.innerWidth < 820;
    };

    addEventListener('keydown', onKey);
    addEventListener('resize', onResize);

    return () => {
      removeEventListener('keydown', onKey);
      removeEventListener('resize', onResize);
      clearTimeout(curtainTimer);
      clearTimeout(curtainClearTimer);
      clearTimeout(jumpTimer);
    };
  });
</script>

<PageBackground />

<div
  style="position:relative;z-index:1;min-height:100vh;color:var(--fg);font-family:'Space Grotesk',system-ui,sans-serif;overflow-x:clip"
>
  <Header
    {isDark}
    {nowItems}
    {nowOpen}
    onHome={goHome}
    onWork={() => jump(() => workEl)}
    onContact={() => jump(() => contactEl)}
    onToggleNow={() => (nowOpen = !nowOpen)}
    onCloseNow={() => (nowOpen = false)}
    onToggleTheme={toggleTheme}
    onToggleConsole={() => (consoleOpen = !consoleOpen)}
  />

  {#if project === null}
    <Hero {site} {isDark} onToggleConsole={() => (consoleOpen = !consoleOpen)} />

    <WorkStage
      projects={scenes}
      {isDark}
      {narrow}
      {reduced}
      total={list.length}
      onOpen={openWithCurtain}
      onArchive={() => jump(() => archiveEl)}
      bind:workEl
    />

    <div style="max-width:1600px;margin:0 auto;padding:0 clamp(20px,6vw,112px);box-sizing:border-box">
      <ProjectIndex
        projects={list}
        {isDark}
        {narrow}
        {reduced}
        onOpen={openWithCurtain}
        bind:archiveEl
        onBitSay={bitSay}
      />
    </div>

    <Contact
      {site}
      onToggleConsole={() => (consoleOpen = !consoleOpen)}
      bind:contactEl
      bind:emailEl
      bind:floorEl
      onLure={onLure}
      onCursor={(on) => (cursor = on)}
    />
  {:else if cur}
    <ProjectView
      project={cur}
      index={project}
      total={list.length}
      prevName={list[(project - 1 + list.length) % list.length].name}
      nextName={list[(project + 1) % list.length].name}
      {isDark}
      onBack={back}
      onPrev={() => step(-1)}
      onNext={() => step(1)}
    />
  {/if}

  {#if curtain !== null}
    <Curtain text={curtain} />
  {/if}

  <ConsoleDrawer open={consoleOpen} onClose={() => (consoleOpen = false)} />
</div>

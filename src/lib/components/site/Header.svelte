<script lang="ts">
  import NowPopover from './NowPopover.svelte';

  type NowItem = { t: string; b: boolean }[];

  let {
    isDark,
    nowItems,
    nowOpen,
    onHome,
    onWork,
    onContact,
    onToggleNow,
    onCloseNow,
    onToggleTheme,
    onToggleConsole
  }: {
    isDark: boolean;
    nowItems: NowItem[];
    nowOpen: boolean;
    onHome: () => void;
    onWork: () => void;
    onContact: () => void;
    onToggleNow: () => void;
    onCloseNow: () => void;
    onToggleTheme: () => void;
    onToggleConsole: () => void;
  } = $props();
</script>

<div
  style="max-width:1600px;margin:0 auto;padding:0 clamp(20px,6vw,112px);box-sizing:border-box;position:relative;z-index:30"
>
  <header
    style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:20px 32px;padding-top:clamp(28px,7vh,72px);font-size:clamp(17px,1.4vw,22px)"
  >
    <nav
      style="display:flex;align-items:center;flex-wrap:wrap;gap:16px clamp(28px,5vw,96px);padding-left:clamp(0px,2.5vw,40px)"
    >
      <!-- svelte-ignore a11y_invalid_attribute -->
      <a
        href="#"
        onclick={(e) => {
          e.preventDefault();
          onHome();
        }}
        style="text-decoration:none;color:var(--fg)"
        class="hover-accent">Home</a
      >
      <!-- svelte-ignore a11y_invalid_attribute -->
      <a
        href="#"
        onclick={(e) => {
          e.preventDefault();
          onWork();
        }}
        style="text-decoration:none;color:var(--fg)"
        class="hover-accent">Work</a
      >
      <div style="position:relative">
        <button
          onclick={onToggleNow}
          aria-expanded={nowOpen}
          style="background:none;border:0;padding:0;font:inherit;color:var(--fg);cursor:pointer;position:relative"
          class="hover-accent"
          >Currently Working On{#if nowOpen}<span
              style="position:absolute;left:0;right:0;bottom:-8px;height:1px;background:currentColor"
            ></span>{/if}</button
        >
        {#if nowOpen}
          <NowPopover {nowItems} onClose={onCloseNow} />
        {/if}
      </div>
      <!-- svelte-ignore a11y_invalid_attribute -->
      <a
        href="#"
        onclick={(e) => {
          e.preventDefault();
          onContact();
        }}
        style="text-decoration:none;color:var(--fg)"
        class="hover-accent">Contact</a
      >
    </nav>
    <div style="display:flex;align-items:center;gap:clamp(24px,3vw,48px)">
      <button
        onclick={onToggleTheme}
        aria-label="Toggle theme"
        style="background:none;border:0;padding:4px;cursor:pointer;display:flex;color:var(--fg)"
      >
        {#if isDark}
          <svg
            width="34"
            height="34"
            viewBox="0 0 24 24"
            fill="none"
            stroke-width="1.8"
            stroke-linecap="round"
            style="stroke:var(--sun)"
          >
            <circle cx="12" cy="12" r="4"></circle>
            <path
              d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
            ></path>
          </svg>
        {:else}
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linejoin="round"
          >
            <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"></path>
          </svg>
        {/if}
      </button>
      <button
        onclick={onToggleConsole}
        style="background:none;border:0;padding:0;font:inherit;color:var(--fg);cursor:pointer"
        class="hover-accent">[G] Console</button
      >
    </div>
  </header>
</div>

<style>
  .hover-accent:hover {
    color: var(--accent) !important;
  }
</style>

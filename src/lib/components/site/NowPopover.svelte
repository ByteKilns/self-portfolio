<script lang="ts">
  type NowItem = { t: string; b: boolean }[];

  let { nowItems, onClose }: { nowItems: NowItem[]; onClose: () => void } = $props();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div onclick={onClose} style="position:fixed;inset:0;z-index:20"></div>
<div
  role="dialog"
  aria-label="Currently working on"
  style="position:absolute;z-index:21;top:calc(100% + 26px);left:-32px;width:min(540px,calc(100vw - 40px));box-sizing:border-box;padding:26px 32px 30px;background:var(--surface);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border:1px solid var(--line);border-radius:4px;box-shadow:var(--shadow);animation:popIn .22s cubic-bezier(.2,.7,.2,1) both;font-size:clamp(16px,1.2vw,19px);line-height:1.6"
>
  <div
    style="display:flex;justify-content:space-between;align-items:baseline;gap:16px;margin-bottom:14px"
  >
    <span>What am I currently doing?</span>
    <button
      onclick={onClose}
      style="background:none;border:0;padding:0;cursor:pointer;font-family:'Space Mono',monospace;font-size:13px;color:var(--fg3)"
      class="hover-accent">[ esc ]</button
    >
  </div>
  <div style="display:flex;flex-direction:column;gap:12px;color:var(--fg2)">
    {#each nowItems as n, i (i)}
      <div style="display:grid;grid-template-columns:22px minmax(0,1fr)">
        <span>—</span>
        <span style="text-wrap:pretty"
          >{#each n as pt, j (j)}{#if pt.b}<strong style="font-weight:600;color:var(--fg)"
                >{pt.t}</strong
              >{:else}{pt.t}{/if}{/each}</span
        >
      </div>
    {/each}
  </div>
</div>

<style>
  .hover-accent:hover {
    color: var(--accent) !important;
  }
</style>

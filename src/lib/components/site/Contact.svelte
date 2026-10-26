<script lang="ts">
  import type { Site } from '#lib/content/types.ts';

  let {
    site,
    onToggleConsole,
    contactEl = $bindable(),
    emailEl = $bindable(),
    floorEl = $bindable(),
    onLure,
    onCursor
  }: {
    site: Site;
    onToggleConsole: () => void;
    contactEl?: HTMLElement | null;
    emailEl?: HTMLAnchorElement | null;
    floorEl?: HTMLDivElement | null;
    onLure: (on: boolean) => void;
    onCursor: (on: boolean) => void;
  } = $props();

  const mailto = $derived('mailto:' + site.email);
</script>

<div style="max-width:1600px;margin:0 auto;padding:0 clamp(20px,6vw,112px) 40px;box-sizing:border-box">
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <section
    bind:this={contactEl}
    data-screen-label="Contact"
    onmousemove={() => onCursor(true)}
    onmouseleave={() => onCursor(false)}
    style="position:relative;margin-top:clamp(64px,10vh,120px);min-height:min(82vh,800px);box-sizing:border-box;border:1px solid var(--line);border-radius:8px;overflow:hidden;background:radial-gradient(70% 90% at 85% 110%,var(--hi),transparent 70%),radial-gradient(50% 60% at 0% 0%,var(--hi),transparent 70%);display:flex;flex-direction:column;gap:40px;padding:clamp(24px,4vw,56px) clamp(24px,4vw,56px) 28px"
  >
    <div
      style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;font-family:'Space Mono',monospace;font-size:12px;color:var(--fg3)"
    >
      <span>( contact )</span>
      <span>say hi to Bit — he lives here.</span>
    </div>
    <div style="flex:1">
      <h2
        style="margin:0 0 20px;font-weight:400;font-size:clamp(36px,5vw,84px);line-height:1;letter-spacing:-.03em;max-width:13ch;text-wrap:balance"
      >
        Got something worth building?
      </h2>
      <p
        style="margin:0 0 clamp(28px,5vh,48px);max-width:46ch;font-size:clamp(17px,1.35vw,21px);line-height:1.6;color:var(--fg2)"
      >
        Let’s connect—feel free to reach out.
      </p>
      <a
        bind:this={emailEl}
        href={mailto}
        onmouseenter={() => onLure(true)}
        onmouseleave={() => onLure(false)}
        style="display:inline-flex;align-items:center;gap:18px;padding:18px 28px;border:1px solid var(--accent);border-radius:999px;text-decoration:none;color:var(--fg);font-size:clamp(20px,2.2vw,34px);transition:background .3s,color .3s"
        class="email-link"
      >
        {site.email} <span style="font-size:.8em">↗</span>
      </a>
    </div>

    <div bind:this={floorEl} style="position:relative;height:150px;flex:none">
      <div style="position:absolute;left:0;right:0;bottom:0;border-top:1px dashed var(--line)"></div>
    </div>

    <div
      style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:20px;font-size:16px;color:var(--fg2)"
    >
      <div style="display:flex;gap:28px;flex-wrap:wrap">
        <a
          href={site.github}
          target="_blank"
          rel="noopener"
          style="color:var(--fg2);text-underline-offset:5px"
          class="hover-accent">GitHub</a
        >
        <a
          href={site.linkedin}
          target="_blank"
          rel="noopener"
          style="color:var(--fg2);text-underline-offset:5px"
          class="hover-accent">LinkedIn</a
        >
        <button
          onclick={onToggleConsole}
          style="background:none;border:0;padding:0;cursor:pointer;font:inherit;color:var(--fg2)"
          class="hover-accent">[G] ask my resume</button
        >
      </div>
      <span style="font-family:'Space Mono',monospace;font-size:12px;color:var(--fg3)"
        >© {new Date().getFullYear()} Nirjal Prajapati</span
      >
    </div>
  </section>
</div>

<style>
  .hover-accent:hover {
    color: var(--accent) !important;
  }

  .email-link:hover {
    background: var(--accent) !important;
    color: #04090c !important;
  }
</style>

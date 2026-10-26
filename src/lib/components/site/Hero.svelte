<script lang="ts">
  import type { Site } from '#lib/content/types.ts';

  let {
    site,
    isDark,
    onToggleConsole
  }: { site: Site; isDark: boolean; onToggleConsole: () => void } = $props();

  const mailto = $derived('mailto:' + site.email);
  const avatarSrc = $derived(isDark ? '/avatar-dark.webp' : '/avatar-light.webp');
</script>

<div
  style="max-width:1600px;margin:0 auto;padding:0 clamp(20px,6vw,112px);box-sizing:border-box;animation:fadeIn .4s ease both"
>
  <section
    data-screen-label="Hero"
    style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:40px;padding:clamp(40px,10vh,104px) 0 clamp(56px,10vh,110px)"
  >
    <div style="flex:1 1 520px;max-width:1080px">
      <h1 style="margin:0 0 24px;font-weight:400;font-size:clamp(24px,2vw,30px)">
        <span data-perch="side" data-say="hi! I’m Bit.">Full Stack Developer</span>
      </h1>
      <p style="margin:0 0 10px;font-size:clamp(17px,1.35vw,21px);line-height:1.6">{site.tagline}</p>
      <p
        style="margin:0 0 20px;font-size:clamp(17px,1.35vw,21px);line-height:1.6;text-wrap:pretty"
      >
        — I’m [ Nirjal Prajapati ], a full-stack developer dedicated to crafting seamless,
        high-performing web applications that make an impact.
      </p>
      <p style="margin:0 0 28px;font-size:clamp(17px,1.35vw,21px);line-height:1.6">
        Let’s connect—feel free to reach out via <a
          href={mailto}
          style="color:var(--fg);text-underline-offset:4px;text-decoration-thickness:1.5px"
          class="hover-accent">email</a
        >
      </p>
      <div style="display:flex;gap:20px;align-items:center;flex-wrap:wrap">
        <a
          href={site.github}
          target="_blank"
          rel="noopener"
          aria-label="GitHub"
          style="color:var(--fg);display:flex"
          class="hover-accent"
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"
            ><path
              d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3"
            ></path></svg
          >
        </a>
        <a
          href={site.linkedin}
          target="_blank"
          rel="noopener"
          aria-label="LinkedIn"
          style="color:var(--fg);display:flex"
          class="hover-accent"
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"
            ><path
              d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.140 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"
            ></path></svg
          >
        </a>
        <button
          onclick={onToggleConsole}
          style="margin-left:12px;white-space:nowrap;display:flex;align-items:center;gap:12px;padding:10px 16px;background:none;border:1px solid var(--line);border-radius:4px;font:inherit;font-size:16px;color:var(--fg2);cursor:pointer"
          class="ask-button"
        >
          <span style="color:var(--accent)">?</span>ask my resume anything<span
            style="font-family:'Space Mono',monospace;font-size:12px;color:var(--fg3)">G</span
          >
        </button>
      </div>
    </div>
    <img
      src={avatarSrc}
      alt="Illustration of Nirjal at a laptop"
      style="flex:none;width:clamp(180px,15vw,285px);height:auto;display:block;-webkit-mask-image:radial-gradient(closest-side,#000 80%,transparent 100%);mask-image:radial-gradient(closest-side,#000 80%,transparent 100%)"
    />
  </section>
</div>

<style>
  .hover-accent:hover {
    color: var(--accent) !important;
  }

  .ask-button:hover {
    color: var(--fg) !important;
    border-color: var(--accent) !important;
  }
</style>

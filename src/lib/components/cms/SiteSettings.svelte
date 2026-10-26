<script lang="ts">
  import type { Site } from '#lib/content/types.ts';

  let {
    site,
    onSite
  }: {
    site: Site;
    onSite: (key: keyof Site, value: string | string[]) => void;
  } = $props();

  const nowText = $derived((site.now || []).join('\n'));
</script>

<div style="padding:14px;display:flex;flex-direction:column;gap:14px;max-width:820px">
  <fieldset
    style="margin:0;padding:12px 14px 14px;border:2px groove #f3eee2;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:12px 14px"
  >
    <legend style="padding:0 6px;font-family:VT323,monospace;font-size:22px;line-height:1"
      >Contact</legend
    >
    <label
      style="grid-column:1/-1;display:flex;flex-direction:column;gap:4px;font-size:12px;color:#4a463d"
      >Email
      <input
        value={site.email}
        oninput={(e) => onSite('email', (e.target as HTMLInputElement).value)}
        style="width:100%;box-sizing:border-box;padding:7px 9px;font:inherit;font-size:14px;color:#1b1f22;outline:none;background:#fffdf5;border:2px solid;border-color:#77705f #fffef8 #fffef8 #77705f"
      />
    </label>
    <label style="display:flex;flex-direction:column;gap:4px;font-size:12px;color:#4a463d"
      >GitHub URL
      <input
        value={site.github}
        oninput={(e) => onSite('github', (e.target as HTMLInputElement).value)}
        placeholder="https://github.com/…"
        style="width:100%;box-sizing:border-box;padding:7px 9px;font:inherit;font-size:14px;color:#1b1f22;outline:none;background:#fffdf5;border:2px solid;border-color:#77705f #fffef8 #fffef8 #77705f"
      />
    </label>
    <label style="display:flex;flex-direction:column;gap:4px;font-size:12px;color:#4a463d"
      >LinkedIn URL
      <input
        value={site.linkedin}
        oninput={(e) => onSite('linkedin', (e.target as HTMLInputElement).value)}
        placeholder="https://linkedin.com/in/…"
        style="width:100%;box-sizing:border-box;padding:7px 9px;font:inherit;font-size:14px;color:#1b1f22;outline:none;background:#fffdf5;border:2px solid;border-color:#77705f #fffef8 #fffef8 #77705f"
      />
    </label>
  </fieldset>
  <fieldset
    style="margin:0;padding:12px 14px 14px;border:2px groove #f3eee2;display:flex;flex-direction:column;gap:12px"
  >
    <legend style="padding:0 6px;font-family:VT323,monospace;font-size:22px;line-height:1"
      >Intro</legend
    >
    <label style="display:flex;flex-direction:column;gap:4px;font-size:12px;color:#4a463d"
      >Tagline under “Full Stack Developer”
      <input
        value={site.tagline}
        oninput={(e) => onSite('tagline', (e.target as HTMLInputElement).value)}
        style="width:100%;box-sizing:border-box;padding:7px 9px;font:inherit;font-size:14px;color:#1b1f22;outline:none;background:#fffdf5;border:2px solid;border-color:#77705f #fffef8 #fffef8 #77705f"
      />
    </label>
    <label style="display:flex;flex-direction:column;gap:4px;font-size:12px;color:#4a463d"
      >Currently working on — one per line, wrap words in **double stars** to bold them
      <textarea
        value={nowText}
        oninput={(e) => onSite('now', (e.target as HTMLTextAreaElement).value.split('\n'))}
        rows="5"
        style="width:100%;box-sizing:border-box;padding:7px 9px;font:inherit;font-size:14px;line-height:1.5;color:#1b1f22;outline:none;resize:vertical;background:#fffdf5;border:2px solid;border-color:#77705f #fffef8 #fffef8 #77705f"
      ></textarea>
    </label>
  </fieldset>
</div>

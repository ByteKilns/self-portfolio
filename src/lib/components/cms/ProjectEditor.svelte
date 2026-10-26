<script lang="ts">
  import { host, mono, slug } from '#lib/content/format.ts';
  import type { Project } from '#lib/content/types.ts';

  let {
    project,
    featCount,
    onField,
    onUpload,
    onClearImage,
    onRemoveChip,
    onAddChip
  }: {
    project: Project;
    featCount: number;
    onField: (key: keyof Project, value: string | number | boolean | string[]) => void;
    onUpload: (file: File) => void;
    onClearImage: () => void;
    onRemoveChip: (label: string) => void;
    onAddChip: (label: string) => void;
  } = $props();

  let stackDraft = $state('');

  const sumLen = $derived((project.summary || '').length);
  const sumColor = $derived(sumLen > 180 ? '#8a2a1c' : '#4a463d');
  const pointsText = $derived((project.points || []).join('\n'));
  const chips = $derived(project.stack || []);
  const hasImage = $derived(!!project.image);
  const noImage = $derived(!project.image);
  const imagePath = $derived(/^data:/.test(project.image || '') ? '' : project.image || '');
  const tint = $derived(
    `linear-gradient(135deg,oklch(0.42 0.08 ${project.hue}),oklch(0.17 0.035 ${project.hue}) 78%)`
  );
  const monogram = $derived(mono(project.name));
  const featColor = $derived(featCount > 4 ? '#8a2a1c' : '#4a463d');
  const hostLabel = $derived(host(project.url) || slug(project.name) + '.com');
  const previewTag = $derived(
    (project.featured ? '[ featured ]' : '[ index ]') +
      (project.year ? ' · ' + project.year : '') +
      (project.draft ? ' · draft' : '')
  );
  const previewSummary = $derived(project.summary || '[ Write-up coming soon ]');

  function addChip(value: string) {
    const text = value.trim().replace(/,$/, '');
    if (!text) return;
    if (!(project.stack || []).includes(text)) onAddChip(text);
    stackDraft = '';
  }

  function pickImage(e: Event) {
    const target = e.target as HTMLInputElement;
    const file = target.files && target.files[0];
    target.value = '';
    if (file) onUpload(file);
  }
</script>

<div style="flex:999 1 460px;min-width:0;display:flex;flex-direction:column;gap:14px">
  <fieldset
    style="margin:0;padding:12px 14px 14px;border:2px groove #f3eee2;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr));gap:12px 14px"
  >
    <legend style="padding:0 6px;font-family:VT323,monospace;font-size:22px;line-height:1"
      >Identity</legend
    >
    <label
      style="grid-column:1/-1;display:flex;flex-direction:column;gap:4px;font-size:12px;color:#4a463d"
      >Project name
      <input
        value={project.name}
        oninput={(e) => onField('name', (e.target as HTMLInputElement).value)}
        style="width:100%;box-sizing:border-box;padding:7px 9px;font:inherit;font-size:15px;color:#1b1f22;outline:none;background:#fffdf5;border:2px solid;border-color:#77705f #fffef8 #fffef8 #77705f"
      />
    </label>
    <label style="display:flex;flex-direction:column;gap:4px;font-size:12px;color:#4a463d"
      >Live URL
      <input
        value={project.url}
        oninput={(e) => onField('url', (e.target as HTMLInputElement).value)}
        placeholder="https://…"
        style="width:100%;box-sizing:border-box;padding:7px 9px;font:inherit;font-size:14px;color:#1b1f22;outline:none;background:#fffdf5;border:2px solid;border-color:#77705f #fffef8 #fffef8 #77705f"
      />
    </label>
    <label style="display:flex;flex-direction:column;gap:4px;font-size:12px;color:#4a463d"
      >Year
      <input
        value={project.year}
        oninput={(e) => onField('year', (e.target as HTMLInputElement).value)}
        placeholder="2026"
        style="width:100%;box-sizing:border-box;padding:7px 9px;font:inherit;font-size:14px;color:#1b1f22;outline:none;background:#fffdf5;border:2px solid;border-color:#77705f #fffef8 #fffef8 #77705f"
      />
    </label>
    <label style="display:flex;flex-direction:column;gap:4px;font-size:12px;color:#4a463d"
      >Role
      <input
        value={project.role}
        oninput={(e) => onField('role', (e.target as HTMLInputElement).value)}
        placeholder="Full-stack, solo"
        style="width:100%;box-sizing:border-box;padding:7px 9px;font:inherit;font-size:14px;color:#1b1f22;outline:none;background:#fffdf5;border:2px solid;border-color:#77705f #fffef8 #fffef8 #77705f"
      />
    </label>
    <label style="display:flex;flex-direction:column;gap:4px;font-size:12px;color:#4a463d"
      >Client
      <input
        value={project.client}
        oninput={(e) => onField('client', (e.target as HTMLInputElement).value)}
        placeholder="optional"
        style="width:100%;box-sizing:border-box;padding:7px 9px;font:inherit;font-size:14px;color:#1b1f22;outline:none;background:#fffdf5;border:2px solid;border-color:#77705f #fffef8 #fffef8 #77705f"
      />
    </label>
  </fieldset>

  <fieldset
    style="margin:0;padding:12px 14px 14px;border:2px groove #f3eee2;display:flex;flex-direction:column;gap:12px"
  >
    <legend style="padding:0 6px;font-family:VT323,monospace;font-size:22px;line-height:1"
      >Story</legend
    >
    <label style="display:flex;flex-direction:column;gap:4px;font-size:12px;color:#4a463d"
      ><span style="display:flex;justify-content:space-between;gap:8px"
        ><span>Summary — one or two lines for cards</span><span style="color:{sumColor}"
          >{sumLen}/180</span
        ></span
      >
      <textarea
        value={project.summary}
        oninput={(e) => onField('summary', (e.target as HTMLTextAreaElement).value)}
        rows="2"
        style="width:100%;box-sizing:border-box;padding:7px 9px;font:inherit;font-size:14px;line-height:1.5;color:#1b1f22;outline:none;resize:vertical;background:#fffdf5;border:2px solid;border-color:#77705f #fffef8 #fffef8 #77705f"
      ></textarea>
    </label>
    <label style="display:flex;flex-direction:column;gap:4px;font-size:12px;color:#4a463d"
      >Highlights — one per line
      <textarea
        value={pointsText}
        oninput={(e) => onField('points', (e.target as HTMLTextAreaElement).value.split('\n'))}
        rows="4"
        placeholder="What it does&#10;What you built&#10;What it changed"
        style="width:100%;box-sizing:border-box;padding:7px 9px;font:inherit;font-size:14px;line-height:1.5;color:#1b1f22;outline:none;resize:vertical;background:#fffdf5;border:2px solid;border-color:#77705f #fffef8 #fffef8 #77705f"
      ></textarea>
    </label>
    <div style="display:flex;flex-direction:column;gap:6px;font-size:12px;color:#4a463d">
      Tech stack — enter to add
      <div
        style="display:flex;flex-wrap:wrap;align-items:center;gap:6px;padding:6px;background:#fffdf5;border:2px solid;border-color:#77705f #fffef8 #fffef8 #77705f"
      >
        {#each chips as c (c)}
          <span
            style="display:inline-flex;align-items:center;gap:6px;padding:2px 4px 2px 8px;background:#1d2b33;color:#f4efe2;font-size:13px;white-space:nowrap"
            >{c}<button
              onclick={() => onRemoveChip(c)}
              aria-label="Remove"
              style="padding:0 4px;border:0;background:none;color:#5fd0c2;font:inherit;cursor:pointer"
              >×</button
            ></span
          >
        {/each}
        <input
          value={stackDraft}
          oninput={(e) => {
            const v = (e.target as HTMLInputElement).value;
            if (v.endsWith(',')) addChip(v);
            else stackDraft = v;
          }}
          onkeydown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addChip(stackDraft);
            } else if (e.key === 'Backspace' && !stackDraft && chips.length) {
              onRemoveChip(chips[chips.length - 1]);
            }
          }}
          placeholder="React…"
          aria-label="Add technology"
          style="flex:1;min-width:100px;padding:3px 4px;border:0;outline:none;background:transparent;font:inherit;font-size:14px;color:#1b1f22"
        />
      </div>
    </div>
  </fieldset>

  <fieldset
    style="margin:0;padding:12px 14px 14px;border:2px groove #f3eee2;display:flex;flex-wrap:wrap;gap:14px"
  >
    <legend style="padding:0 6px;font-family:VT323,monospace;font-size:22px;line-height:1"
      >Media</legend
    >
    <div
      style="flex:0 1 240px;aspect-ratio:16/10;background:#fffdf5;border:2px solid;border-color:#77705f #fffef8 #fffef8 #77705f;position:relative;overflow:hidden"
    >
      {#if hasImage}
        <img
          src={project.image}
          alt=""
          style="width:100%;height:100%;object-fit:cover;object-position:top;display:block"
        />
      {:else}
        <div
          style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:{tint};color:#e7ecee;font-family:'Space Grotesk',sans-serif;font-size:44px;letter-spacing:-.05em"
        >
          {monogram}
        </div>
      {/if}
    </div>
    <div
      style="flex:1 1 220px;display:flex;flex-direction:column;gap:10px;font-size:12px;color:#4a463d"
    >
      <div style="display:flex;flex-wrap:wrap;gap:6px">
        <label
          style="padding:6px 12px;font-size:13px;color:#1b1f22;cursor:pointer;background:#d9d3c5;border:2px solid;border-color:#fffef8 #77705f #77705f #fffef8"
          >Upload screenshot…<input
            type="file"
            accept="image/*"
            onchange={pickImage}
            style="display:none"
          /></label
        >
        {#if hasImage}
          <button
            onclick={onClearImage}
            style="padding:6px 12px;font:inherit;font-size:13px;color:#8a2a1c;cursor:pointer;background:#d9d3c5;border:2px solid;border-color:#fffef8 #77705f #77705f #fffef8"
            class="pressed">Remove</button
          >
        {/if}
      </div>
      <label style="display:flex;flex-direction:column;gap:4px"
        >…or image path
        <input
          value={imagePath}
          oninput={(e) => onField('image', (e.target as HTMLInputElement).value)}
          placeholder="assets/project.png"
          style="width:100%;box-sizing:border-box;padding:7px 9px;font:inherit;font-size:13px;color:#1b1f22;outline:none;background:#fffdf5;border:2px solid;border-color:#77705f #fffef8 #fffef8 #77705f"
        />
      </label>
      <label style="display:flex;flex-direction:column;gap:4px"
        >Placeholder tint — used until there’s a screenshot
        <input
          type="range"
          min="0"
          max="360"
          value={project.hue}
          oninput={(e) => onField('hue', +(e.target as HTMLInputElement).value)}
          style="width:100%;accent-color:#0b7a74"
        />
      </label>
      <span>uploads are saved as WebP in static/projects.</span>
    </div>
  </fieldset>

  <fieldset
    style="margin:0;padding:12px 14px 14px;border:2px groove #f3eee2;display:flex;flex-wrap:wrap;gap:10px 28px;align-items:center"
  >
    <legend style="padding:0 6px;font-family:VT323,monospace;font-size:22px;line-height:1"
      >Display</legend
    >
    <label style="display:flex;align-items:center;gap:8px;cursor:pointer"
      ><input
        type="checkbox"
        checked={project.featured}
        onchange={(e) => onField('featured', (e.target as HTMLInputElement).checked)}
        style="width:16px;height:16px;accent-color:#0b7a74"
      />Featured on the stage
      <span style="font-size:12px;color:{featColor}">({featCount}/4)</span></label
    >
    <label style="display:flex;align-items:center;gap:8px;cursor:pointer"
      ><input
        type="checkbox"
        checked={project.draft}
        onchange={(e) => onField('draft', (e.target as HTMLInputElement).checked)}
        style="width:16px;height:16px;accent-color:#0b7a74"
      />Draft — hidden from site</label
    >
  </fieldset>

  <div style="display:flex;flex-direction:column;gap:6px">
    <span style="font-family:VT323,monospace;font-size:22px;line-height:1">Preview</span>
    <div
      style="display:flex;flex-wrap:wrap;gap:20px;padding:20px;background:#04090c;color:#e7ecee;font-family:'Space Grotesk',sans-serif;border:2px solid;border-color:#77705f #fffef8 #fffef8 #77705f"
    >
      <div
        style="flex:0 1 260px;border-radius:6px;overflow:hidden;border:1px solid rgba(231,236,238,.14)"
      >
        <div
          style="display:flex;gap:5px;align-items:center;padding:7px 10px;background:rgba(6,15,18,.9);border-bottom:1px solid rgba(231,236,238,.14)"
        >
          <span style="width:6px;height:6px;border-radius:50%;background:#7f8d92"></span><span
            style="width:6px;height:6px;border-radius:50%;background:#7f8d92"
          ></span><span style="width:6px;height:6px;border-radius:50%;background:#7f8d92"
          ></span><span
            style="margin-left:6px;font-family:'Space Mono',monospace;font-size:10px;color:#7f8d92;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"
            >{hostLabel}</span
          >
        </div>
        <div style="aspect-ratio:16/10;position:relative">
          {#if hasImage}
            <img
              src={project.image}
              alt=""
              style="width:100%;height:100%;object-fit:cover;object-position:top;display:block"
            />
          {:else}
            <div
              style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:{tint};font-size:48px;letter-spacing:-.05em"
            >
              {monogram}
            </div>
          {/if}
        </div>
      </div>
      <div style="flex:1 1 220px;display:flex;flex-direction:column;gap:10px;min-width:0">
        <span style="font-family:'Space Mono',monospace;font-size:11px;color:#7f8d92"
          >{previewTag}</span
        >
        <span style="font-size:26px;line-height:1.05;letter-spacing:-.03em;text-wrap:balance"
          >{project.name}</span
        >
        <span style="font-size:14px;line-height:1.55;color:#b3bfc3;text-wrap:pretty"
          >{previewSummary}</span
        >
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          {#each chips as c (c)}<span
              style="padding:3px 9px;border:1px solid rgba(231,236,238,.14);border-radius:999px;font-family:'Space Mono',monospace;font-size:10px;color:#b3bfc3;white-space:nowrap"
              >{c}</span
            >{/each}
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .pressed:active {
    border-color: #77705f #fffef8 #fffef8 #77705f !important;
  }
</style>

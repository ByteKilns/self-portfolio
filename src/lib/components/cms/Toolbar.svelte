<script lang="ts">
  let {
    onAdd,
    onDup,
    onDel,
    onMoveUp,
    onMoveDown,
    onSave,
    onExport,
    onImport,
    onReset,
    onLogout
  }: {
    onAdd: () => void;
    onDup: () => void;
    onDel: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onSave: () => void;
    onExport: () => void;
    onImport: (e: Event) => void;
    onReset: () => void;
    onLogout: () => void;
  } = $props();
</script>

<div style="display:flex;flex-wrap:wrap;align-items:center;gap:6px;padding:8px;border-bottom:2px solid #9d9686">
  <button
    onclick={onAdd}
    style="padding:6px 12px;font:inherit;font-size:13px;color:#1b1f22;cursor:pointer;background:#d9d3c5;border:2px solid;border-color:#fffef8 #77705f #77705f #fffef8"
    class="pressed">+ New</button
  >
  <button
    onclick={onDup}
    style="padding:6px 12px;font:inherit;font-size:13px;color:#1b1f22;cursor:pointer;background:#d9d3c5;border:2px solid;border-color:#fffef8 #77705f #77705f #fffef8"
    class="pressed">Duplicate</button
  >
  <button
    onclick={onDel}
    style="padding:6px 12px;font:inherit;font-size:13px;color:#8a2a1c;cursor:pointer;background:#d9d3c5;border:2px solid;border-color:#fffef8 #77705f #77705f #fffef8"
    class="pressed">Delete</button
  >
  <span
    style="width:2px;height:26px;margin:0 4px;border-left:1px solid #77705f;border-right:1px solid #fffef8"
  ></span>
  <button
    onclick={onMoveUp}
    aria-label="Move up"
    style="padding:6px 10px;font:inherit;font-size:13px;color:#1b1f22;cursor:pointer;background:#d9d3c5;border:2px solid;border-color:#fffef8 #77705f #77705f #fffef8"
    class="pressed">▲</button
  >
  <button
    onclick={onMoveDown}
    aria-label="Move down"
    style="padding:6px 10px;font:inherit;font-size:13px;color:#1b1f22;cursor:pointer;background:#d9d3c5;border:2px solid;border-color:#fffef8 #77705f #77705f #fffef8"
    class="pressed">▼</button
  >
  <span
    style="width:2px;height:26px;margin:0 4px;border-left:1px solid #77705f;border-right:1px solid #fffef8"
  ></span>
  <button
    onclick={onSave}
    style="padding:6px 14px;font:inherit;font-size:13px;font-weight:600;color:#fffdf5;cursor:pointer;background:#0b7a74;border:2px solid;border-color:#7fd9cf #053d3a #053d3a #7fd9cf"
    class="pressed">Save <span style="font-weight:400;opacity:.8">ctrl+s</span></button
  >
  <button
    onclick={onExport}
    style="padding:6px 12px;font:inherit;font-size:13px;color:#1b1f22;cursor:pointer;background:#d9d3c5;border:2px solid;border-color:#fffef8 #77705f #77705f #fffef8"
    class="pressed">Export</button
  >
  <label
    style="padding:6px 12px;font-size:13px;cursor:pointer;background:#d9d3c5;border:2px solid;border-color:#fffef8 #77705f #77705f #fffef8"
    >Import<input
      type="file"
      accept=".json,application/json"
      onchange={onImport}
      style="display:none"
    /></label
  >
  <button
    onclick={onReset}
    style="padding:6px 12px;font:inherit;font-size:13px;color:#1b1f22;cursor:pointer;background:#d9d3c5;border:2px solid;border-color:#fffef8 #77705f #77705f #fffef8"
    class="pressed">Reset</button
  >
  <a
    href="/"
    target="_blank"
    rel="noopener"
    style="margin-left:auto;padding:6px 12px;font-size:13px;color:#1b1f22;text-decoration:none;background:#d9d3c5;border:2px solid;border-color:#fffef8 #77705f #77705f #fffef8"
    class="open-site">Open site ↗</a
  >
  <button
    onclick={onLogout}
    style="padding:6px 12px;font:inherit;font-size:13px;color:#1b1f22;cursor:pointer;background:#d9d3c5;border:2px solid;border-color:#fffef8 #77705f #77705f #fffef8"
    class="pressed">Log out</button
  >
</div>

<style>
  .pressed:active {
    border-color: #77705f #fffef8 #fffef8 #77705f !important;
  }

  .open-site:hover {
    color: #0b5f5a !important;
  }
</style>

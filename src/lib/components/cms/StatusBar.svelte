<script lang="ts">
  let {
    live,
    draft,
    featCount,
    tip,
    tipColor,
    savedLabel
  }: {
    live: number;
    draft: number;
    featCount: number;
    tip: string;
    tipColor: string;
    savedLabel: string;
  } = $props();
</script>

<div
  style="display:flex;flex-wrap:wrap;align-items:center;gap:6px;padding:6px 8px;border-top:2px solid #9d9686;font-size:12px"
>
  <span
    style="padding:3px 8px;border:1px solid;border-color:#77705f #fffef8 #fffef8 #77705f;white-space:nowrap"
    >{live} live · {draft} draft</span
  >
  <span
    style="padding:3px 8px;border:1px solid;border-color:#77705f #fffef8 #fffef8 #77705f;white-space:nowrap"
    >★ {featCount} featured</span
  >
  <span
    style="flex:1;min-width:200px;display:flex;align-items:center;gap:8px;padding:3px 8px;border:1px solid;border-color:#77705f #fffef8 #fffef8 #77705f;color:{tipColor}"
  >
    <svg width="16" height="16" viewBox="0 0 120 120" aria-hidden="true" style="flex:none"
      ><rect x="20" y="34" width="80" height="74" rx="37" fill="#34b2a4"></rect><path
        d="M60 36 Q58 24 61 15"
        stroke="#5fbf6e"
        stroke-width="7"
        fill="none"
      ></path><circle cx="46" cy="68" r="9" fill="#1b1f22"></circle><circle
        cx="74"
        cy="68"
        r="9"
        fill="#1b1f22"
      ></circle></svg
    >
    <span>Bit: {tip}</span><span class="cursor">_</span>
  </span>
  <span
    style="padding:3px 8px;border:1px solid;border-color:#77705f #fffef8 #fffef8 #77705f;white-space:nowrap"
    >{savedLabel}</span
  >
</div>

<style>
  @keyframes cmsBlink {
    50% {
      opacity: 0;
    }
  }

  .cursor {
    animation: cmsBlink 1s steps(1) infinite;
  }
</style>

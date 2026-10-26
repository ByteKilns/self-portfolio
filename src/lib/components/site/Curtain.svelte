<script lang="ts">
  let { text }: { text: string } = $props();
</script>

<div
  aria-hidden="true"
  style="position:fixed;inset:0;z-index:90;background:var(--accent);color:#04090c;display:flex;align-items:center;justify-content:center;animation:curtain 1s cubic-bezier(.7,0,.2,1) both;pointer-events:none"
>
  <span
    style="font-size:clamp(28px,3.4vw,58px);letter-spacing:-.03em;padding:0 24px;text-align:center"
    >{text}</span
  >
</div>

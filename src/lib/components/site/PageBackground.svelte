<div aria-hidden="true" class="bg"></div>

<style>
  .bg {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    background: url(/bg/gradient-light.webp) center/cover no-repeat;
  }

  :global(html.dark) .bg {
    background-image: url(/bg/gradient-dark.webp);
  }
</style>

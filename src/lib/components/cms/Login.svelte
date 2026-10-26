<script lang="ts">
  let {
    isSetup,
    loginTitle,
    loginHead,
    loginSub,
    loginBtn,
    loginTip,
    pwAuto,
    lu,
    lp,
    lp2,
    loginErr,
    hasLoginErr,
    remember,
    onLu,
    onLp,
    onLp2,
    onRemember,
    onLogin
  }: {
    isSetup: boolean;
    loginTitle: string;
    loginHead: string;
    loginSub: string;
    loginBtn: string;
    loginTip: string;
    pwAuto: 'new-password' | 'current-password';
    lu: string;
    lp: string;
    lp2: string;
    loginErr: string;
    hasLoginErr: boolean;
    remember: boolean;
    onLu: (e: Event) => void;
    onLp: (e: Event) => void;
    onLp2: (e: Event) => void;
    onRemember: (e: Event) => void;
    onLogin: (e: Event) => void;
  } = $props();
</script>

<div
  style="min-height:calc(100vh - 2 * clamp(10px,2.5vw,32px));display:flex;align-items:center;justify-content:center"
>
  <form
    onsubmit={onLogin}
    style="width:min(420px,100%);background:#d9d3c5;border:2px solid;border-color:#fffef8 #3b372f #3b372f #fffef8;box-shadow:6px 6px 0 rgba(0,0,0,.35);display:flex;flex-direction:column"
  >
    <div
      style="display:flex;align-items:center;gap:10px;padding:5px 8px 5px 12px;background:#1d2b33;color:#f4efe2"
    >
      <span style="font-family:VT323,monospace;font-size:22px;line-height:1;white-space:nowrap"
        >BIT·CMS — {loginTitle}</span
      >
      <span
        aria-hidden="true"
        style="flex:1;height:10px;min-width:20px;background:repeating-linear-gradient(0deg,#f4efe2 0 1px,transparent 1px 3px);opacity:.35"
      ></span>
    </div>
    <div style="display:flex;gap:16px;align-items:center;padding:20px 20px 6px">
      <svg
        width="64"
        height="64"
        viewBox="0 0 120 120"
        aria-hidden="true"
        style="flex:none"
        ><ellipse cx="60" cy="112" rx="30" ry="5" fill="#000" opacity=".18"></ellipse><rect
          x="20"
          y="34"
          width="80"
          height="74"
          rx="37"
          fill="#34b2a4"
        ></rect><path
          d="M60 36 Q58 24 61 15"
          stroke="#5fbf6e"
          stroke-width="4"
          fill="none"
          stroke-linecap="round"
        ></path><ellipse
          cx="53"
          cy="17"
          rx="8"
          ry="4.5"
          fill="#9ee07a"
          transform="rotate(-28 53 17)"
        ></ellipse><ellipse
          cx="68"
          cy="13"
          rx="8.5"
          ry="4.8"
          fill="#9ee07a"
          transform="rotate(24 68 13)"
        ></ellipse><ellipse cx="46" cy="66" rx="10" ry="11.5" fill="#fff"></ellipse><ellipse
          cx="74"
          cy="66"
          rx="10"
          ry="11.5"
          fill="#fff"
        ></ellipse><circle cx="47" cy="68" r="5.8" fill="#10262a"></circle><circle
          cx="75"
          cy="68"
          r="5.8"
          fill="#10262a"
        ></circle><path
          d="M55 84 Q60 89 65 84"
          fill="none"
          stroke="#10262a"
          stroke-width="2.6"
          stroke-linecap="round"
        ></path></svg
      >
      <div style="display:flex;flex-direction:column;gap:4px">
        <span style="font-family:VT323,monospace;font-size:26px;line-height:1">{loginHead}</span>
        <span style="font-size:12px;line-height:1.5;color:#4a463d;text-wrap:pretty">{loginSub}</span>
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:12px;padding:14px 20px 18px">
      <label style="display:flex;flex-direction:column;gap:4px;font-size:12px;color:#4a463d"
        >Username
        <!-- svelte-ignore a11y_autofocus -->
        <input
          value={lu}
          oninput={onLu}
          autocomplete="username"
          autofocus
          style="width:100%;box-sizing:border-box;padding:7px 9px;font:inherit;font-size:14px;color:#1b1f22;outline:none;background:#fffdf5;border:2px solid;border-color:#77705f #fffef8 #fffef8 #77705f"
        />
      </label>
      <label style="display:flex;flex-direction:column;gap:4px;font-size:12px;color:#4a463d"
        >Password
        <input
          type="password"
          value={lp}
          oninput={onLp}
          autocomplete={pwAuto}
          style="width:100%;box-sizing:border-box;padding:7px 9px;font:inherit;font-size:14px;color:#1b1f22;outline:none;background:#fffdf5;border:2px solid;border-color:#77705f #fffef8 #fffef8 #77705f"
        />
      </label>
      {#if isSetup}
        <label style="display:flex;flex-direction:column;gap:4px;font-size:12px;color:#4a463d"
          >Confirm password
          <input
            type="password"
            value={lp2}
            oninput={onLp2}
            autocomplete="new-password"
            style="width:100%;box-sizing:border-box;padding:7px 9px;font:inherit;font-size:14px;color:#1b1f22;outline:none;background:#fffdf5;border:2px solid;border-color:#77705f #fffef8 #fffef8 #77705f"
          />
        </label>
      {/if}
      {#if hasLoginErr}
        <div role="alert" style="padding:6px 9px;font-size:12px;color:#fffdf5;background:#8a2a1c"
          >{loginErr}</div
        >
      {/if}
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:4px">
        <label
          style="display:flex;align-items:center;gap:8px;font-size:12px;color:#4a463d;cursor:pointer"
          ><input
            type="checkbox"
            checked={remember}
            onchange={onRemember}
            style="width:15px;height:15px;accent-color:#0b7a74"
          />Stay signed in</label
        >
        <button
          type="submit"
          style="padding:7px 18px;font:inherit;font-size:13px;font-weight:600;color:#fffdf5;cursor:pointer;background:#0b7a74;border:2px solid;border-color:#7fd9cf #053d3a #053d3a #7fd9cf"
          class="pressed">{loginBtn}</button
        >
      </div>
    </div>
    <div
      style="padding:5px 10px;border-top:2px solid #9d9686;font-size:11px;color:#4a463d"
    >Bit: {loginTip}</div>
  </form>
</div>

<style>
  .pressed:active {
    border-color: #053d3a #7fd9cf #7fd9cf #053d3a !important;
  }
</style>

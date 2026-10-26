<script lang="ts">
  import { tick } from 'svelte';
  import { sendChat } from '#lib/chat/client.ts';
  import type { ChatTurn } from '#lib/chat/types.ts';

  type Message = { who: 'bot' | 'user'; text: string; error?: boolean };

  const GREETING =
    'Hi! I’m Nirjal Prajapati’s resume. Ask me about his skills, experience or projects.';
  const SUGGEST = ['skills', 'projects', 'experience', 'contact'];

  let { open, onClose }: { open: boolean; onClose: () => void } = $props();

  let messages = $state<Message[]>([{ who: 'bot', text: GREETING }]);
  let typing = $state(false);
  let draft = $state('');
  let logEl = $state<HTMLDivElement | null>(null);
  let inputEl = $state<HTMLInputElement | null>(null);
  let controller: AbortController | null = null;

  function conversationHistory(): ChatTurn[] {
    return messages
      .filter((m, index) => !(index === 0 && m.who === 'bot') && !m.error)
      .map((m): ChatTurn => ({ role: m.who === 'user' ? 'user' : 'assistant', content: m.text }))
      .filter((turn) => turn.content.trim() !== '')
      .slice(-6);
  }

  async function send(text?: string) {
    const t = (text ?? draft).trim();
    if (!t || typing) return;
    const history = conversationHistory();
    messages.push({ who: 'user', text: t });
    draft = '';
    typing = true;
    messages.push({ who: 'bot', text: '' });
    const index = messages.length - 1;
    controller = new AbortController();
    let first = true;
    try {
      await sendChat({
        message: t,
        history,
        signal: controller.signal,
        onChunk(chunk) {
          if (first) {
            first = false;
            typing = false;
          }
          messages[index].text += chunk;
        }
      });
    } catch (error) {
      const name = error instanceof Error ? error.name : '';
      if (name === 'AbortError') {
        if (messages[index].text === '') messages.splice(index, 1);
      } else {
        const text = error instanceof Error ? error.message : 'Something went wrong.';
        const partial = messages[index].text;
        messages[index].text = partial ? `${partial}\n\n${text}` : text;
        messages[index].error = true;
      }
    } finally {
      typing = false;
      controller = null;
    }
  }

  function onInputKey(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      void send();
    }
  }

  $effect(() => {
    if (!open) return;
    const timer = setTimeout(() => inputEl?.focus(), 60);
    return () => clearTimeout(timer);
  });

  $effect(() => {
    void messages.length;
    void typing;
    messages.forEach((m) => void m.text);
    void tick().then(() => {
      if (logEl) logEl.scrollTop = logEl.scrollHeight;
    });
  });

  $effect(() => () => controller?.abort());
</script>

{#if open}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    onclick={onClose}
    style="position:fixed;inset:0;z-index:40;background:var(--scrim);animation:fadeIn .2s ease both"
  ></div>
  <!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
  <aside
    role="dialog"
    aria-label="Console"
    style="position:fixed;top:0;right:0;bottom:0;z-index:41;width:min(500px,100vw);box-sizing:border-box;display:flex;flex-direction:column;background:var(--surface);backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px);border-left:1px solid var(--line);box-shadow:var(--shadow);animation:drawerIn .28s cubic-bezier(.2,.7,.2,1) both"
  >
    <div
      style="display:flex;justify-content:space-between;align-items:center;gap:16px;padding:clamp(28px,7vh,72px) 36px 22px;border-bottom:1px solid var(--line)"
    >
      <div style="display:flex;align-items:baseline;gap:14px;flex-wrap:wrap">
        <span style="font-size:clamp(17px,1.4vw,22px)">[G] Console</span>
        <span style="font-family:'Space Mono',monospace;font-size:12px;color:var(--fg3)"
          >talk to my resume</span
        >
      </div>
      <button
        onclick={onClose}
        style="background:none;border:0;padding:0;cursor:pointer;font-family:'Space Mono',monospace;font-size:13px;color:var(--fg2)"
        class="hover-accent">[ esc ]</button
      >
    </div>
    <div
      bind:this={logEl}
      style="flex:1;overflow-y:auto;padding:28px 36px;display:flex;flex-direction:column;gap:18px;font-size:17px;line-height:1.6"
    >
      {#each messages as m, i (i)}
        {#if m.who === 'bot'}
          {#if m.text !== ''}
            <div
              style="display:grid;grid-template-columns:20px minmax(0,1fr);animation:riseIn .25s ease both"
            >
              <span style="color:var(--fg3)">-</span><span style="text-wrap:pretty">{m.text}</span>
            </div>
          {/if}
        {:else}
          <div style="display:grid;grid-template-columns:20px minmax(0,1fr)">
            <span style="color:var(--accent)">?</span><span style="color:var(--fg2)">{m.text}</span>
          </div>
        {/if}
      {/each}
      {#if typing}
        <div style="display:grid;grid-template-columns:20px minmax(0,1fr)">
          <span style="color:var(--fg3)">-</span><span
            style="color:var(--fg3);letter-spacing:.2em;animation:blink 1s steps(2) infinite">···</span
          >
        </div>
      {/if}
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:8px 18px;padding:0 36px 16px;font-size:15px">
      {#each SUGGEST as s (s)}
        <button
          onclick={() => send(s)}
          style="background:none;border:0;padding:4px 0;cursor:pointer;font:inherit;color:var(--fg2)"
          class="hover-accent">[ {s} ]</button
        >
      {/each}
    </div>
    <div style="border-top:1px solid var(--line);padding:18px 36px 26px">
      <label
        style="display:grid;grid-template-columns:20px minmax(0,1fr);align-items:center;font-size:18px"
      >
        <span style="color:var(--accent)">?</span>
        <input
          bind:this={inputEl}
          bind:value={draft}
          onkeydown={onInputKey}
          placeholder="ask about skills, projects, contact…"
          aria-label="Ask the console"
          style="width:100%;background:transparent;border:0;outline:none;padding:6px 0;font:inherit;color:var(--fg);caret-color:var(--accent)"
        />
      </label>
    </div>
  </aside>
{/if}

<style>
  .hover-accent:hover {
    color: var(--accent) !important;
  }
</style>

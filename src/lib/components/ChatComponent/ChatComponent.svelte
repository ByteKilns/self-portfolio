<script lang="ts">
  import { onDestroy, onMount, tick } from 'svelte';
  import type { Chat } from '$lib/types';
  import type { ChatTurn } from '$lib/chat/types';
  import { sendChat } from '$lib/chat/client';

  type ChatLine = Chat & { isError?: boolean };

  const GREETING =
    "Hi! I'm Nirjal Prajapati's CV assistant. Ask me about his skills, experience or projects.";

  // Using Svelte 5 runes syntax for all reactive state
  let query = $state('');
  let chatHistory = $state<ChatLine[]>([{ message: GREETING, type: 'answer' }]);
  let inputElement: HTMLInputElement;
  let isTyping = $state(false);
  let controller: AbortController | null = null;

  onMount(() => {
    inputElement?.focus();
  });

  onDestroy(() => {
    controller?.abort();
  });

  function conversationHistory(): ChatTurn[] {
    return chatHistory
      .filter((chat, index) => !(index === 0 && chat.type === 'answer') && !chat.isError)
      .map(
        (chat): ChatTurn => ({
          role: chat.type === 'query' ? 'user' : 'assistant',
          content: chat.message
        })
      )
      .filter((turn) => turn.content.trim() !== '')
      .slice(-6);
  }

  async function handleKeyDown(event: KeyboardEvent) {
    if (event.key !== 'Enter' || query.trim() === '' || isTyping) return;

    const message = query.trim();
    const history = conversationHistory();

    query = '';
    chatHistory.push({ message, type: 'query' });
    chatHistory.push({ message: '', type: 'answer' });
    const answerIndex = chatHistory.length - 1;

    isTyping = true;
    controller = new AbortController();

    try {
      await sendChat({
        message,
        history,
        onChunk(text) {
          chatHistory[answerIndex].message += text;
        },
        signal: controller.signal
      });
    } catch (error) {
      const name = error instanceof Error ? error.name : '';
      if (name === 'AbortError') {
        if (chatHistory[answerIndex].message === '') chatHistory.splice(answerIndex, 1);
      } else {
        const text = error instanceof Error ? error.message : 'Something went wrong.';
        const partial = chatHistory[answerIndex].message;
        chatHistory[answerIndex].message = partial ? `${partial}\n\n${text}` : text;
        chatHistory[answerIndex].isError = true;
      }
    } finally {
      isTyping = false;
      controller = null;
      await tick();
      inputElement?.focus();
    }
  }
</script>

<section class="flex flex-col gap-2">
  {#each chatHistory as chat, i (i)}
    <div class="flex gap-1">
      {#if chat.type === "query"}
        <span>?</span>
      {:else}
        <span>-</span>
      {/if}
      <div>
        {chat.message}
      </div>
    </div>
  {/each}

  <div class="flex items-center gap-1">
    <span>?</span>
    <input
      class="bg-transparent outline-none w-full"
      bind:value={query}
      bind:this={inputElement}
      onkeydown={handleKeyDown}
      disabled={isTyping}
    />
  </div>
</section>

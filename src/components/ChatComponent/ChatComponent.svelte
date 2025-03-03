
<script lang="ts">
    import type { Chat } from "../../types/types";
  
    let query = $state("");
    let chatHistory: Chat[] = [
      {
        message: "Hey there! I'm here on behalf of Nirjal. How can I assist you?",
        type: "query",
      },
    ];
  
    $effect(() => {
      console.log("Query changed to:", query);
    });
  </script>

<section class="flex flex-col gap-2">
    {#each chatHistory as chat (chat.type)}
    <div class="flex gap-1">
        {#if chat.type == "query"}
        <span class="">-</span>
        {:else}
        <span class="">?</span>
        {/if}
        <div class="">{chat.message}</div>
    </div>    
    {/each}
    <input class="border z-30" style="z-index:2" bind:value={query} />
</section>



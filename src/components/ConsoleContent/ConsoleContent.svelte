<script lang="ts">
  import type { Box } from "../../types/types";
  import ChatComponent from "../ChatComponent/ChatComponent.svelte";

    export let box:Box; 
</script>
<div class="p-4 h-full flex flex-col text-gray-700">
    <!-- <h3 class="text-lg font-semibold {box.content.titleColor}">{box.content.title}</h3> -->
    <p class="text-sm text-gray-600 mt-1">{box.content.description}</p>
    <div class="w-full h-fit scroll-auto">
        <ChatComponent/>        
    </div>
    <div class="mt-auto text-xs text-gray-500">
      ID: {box.id}
    </div>
  </div>
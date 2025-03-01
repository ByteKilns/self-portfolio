<script lang="ts">
    import type { Project } from '../../types/types.ts'; // Import the Project type
    import { X } from 'lucide-svelte';
  
    // Define the props for the component
    export let isOpen = false;
    export let onClose: () => void = () => {};
    export let project: Project | undefined = undefined; // Add the project prop with type Project
  
    function handleBackdropClick(event: any) {
      if (event.target === event.currentTarget) {
        onClose();
      }
    }       
  </script>
  
  <div
  class="fixed inset-0 bg-black/30 backdrop-blur-[0.2px] bg-blend-overlay transition-opacity duration-700 ease-in-out"
  class:opacity-0={!isOpen}
  class:opacity-100={isOpen}
  class:pointer-events-none={!isOpen}
  class:pointer-events-auto={isOpen}
  role="button"
  tabindex="0"
  on:click={handleBackdropClick}
  on:keydown={(e) => {
    if (e.key === "Enter" || e.key === "Space") {
      handleBackdropClick(e);
    }
  }}
>
  <div
    class="px-16 py-10 fixed bottom-0 left-0 right-0 bg-white border border-black h-[80vh] transition-transform duration-700 ease-in-out"
    class:translate-y-full={!isOpen}
    class:translate-y-0={isOpen}
  >
    <div class="p-6 flex flex-col items-end justify-end">
        <button class="bg-transparent border-none p-0" on:click={onClose}>
            <X class='text-red-600 cursor-pointer'/>
          </button>
    </div>
    <slot />
  </div>
</div>
  
  <style>
    /* Add any additional styles here if needed */
  </style>
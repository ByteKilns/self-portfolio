<script lang="ts">
    import { writable } from 'svelte/store';
    import { X } from 'lucide-svelte';
    
    export let isOpen = false;
    export let isDarkMode = writable(false);
    export let onClose: () => void = () => {};
    export let anchorPosition = { x: 0, y: 0, width: 0 }; // Add this prop to track the button position
    
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
        class="fixed w-[40vw] transition-transform duration-700 border-gray-700 border-1 ease-in-out"
        style="top: {anchorPosition.y + 40}px; left: {anchorPosition.x}px;"
        class:translate-y-[-100%]={!isOpen}
        class:translate-y-0={isOpen}
    >
        <div
            class="px-8 py-8 h-full w-full {$isDarkMode ? "bg-[url('/modal-dark-bg.png')] bg-cover bg-center" : "bg-white"} text-gray-700 bg-cover bg-center"
        >
            <div class="flex flex-col items-end justify-end">
                <button class="bg-transparent border-none p-0" on:click={onClose}>
                    <X class='text-red-600 cursor-pointer'/>
                </button>
            </div>
            <slot />
        </div>
    </div>
</div>
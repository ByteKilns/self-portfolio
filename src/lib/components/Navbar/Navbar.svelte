<script lang="ts">
  import { Sun, Moon, Menu, X } from 'lucide-svelte';
  import { fly, fade } from 'svelte/transition';
  
  // Props passed from parent component
  export let workingOnButtonEl: HTMLElement;
  export let handleWorkingModalToggle: () => void;
  export let toggleTheme: () => void;
  export let isDarkMode: any; // Svelte store
  export let handleConsoleToggle: () => void;
  
  // Local state for sidebar
  let isSidebarOpen = false;
  
  function toggleSidebar() {
    isSidebarOpen = !isSidebarOpen;
  }
  
  function closeSidebar() {
    isSidebarOpen = false;
  }
  
  // Close sidebar on escape key
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && isSidebarOpen) {
      closeSidebar();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- Desktop Navigation -->
<nav class="flex justify-between items-center mb-16 mt-12 lg:flex hidden px-4 sm:px-6 lg:px-8">
  <div class="flex gap-24">
    <a href="/" class="text-lg hover:opacity-70 transition-opacity">Home</a>
    <button bind:this={workingOnButtonEl}
            on:click={handleWorkingModalToggle}
            data-text-primary
            class="text-lg cursor-pointer hover:opacity-70 transition-opacity">
      Currently Working On
    </button>
  </div>
  <div class="flex items-center gap-8">
    <button on:click={toggleTheme} 
            class="cursor-pointer transition-colors {$isDarkMode ? 'text-yellow-400 hover:text-yellow-300' : 'text-gray-800 hover:text-gray-600'}"
            aria-label="Toggle theme">
      {#if $isDarkMode}
        <Sun size={30} />
      {:else}
        <Moon size={24} />
      {/if}
    </button>
    <button on:click={handleConsoleToggle} 
            class="data-text-primary text-lg cursor-pointer hover:opacity-70 transition-opacity">
      [G] Console
    </button>
  </div>
</nav>

<!-- Mobile Navigation -->
<nav class="flex justify-between items-center mb-16 mt-12 lg:hidden px-4 sm:px-6">
  <a href="/" class="text-lg hover:opacity-70 transition-opacity">Home</a>
  <button on:click={toggleSidebar} 
          class="cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
          aria-label="Open menu">
    <Menu size={24} />
  </button>
</nav>

<!-- Mobile Sidebar -->
{#if isSidebarOpen}
  <!-- Backdrop -->
  <div class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
       on:click={closeSidebar}
       on:keydown={() => {}}
       role="button"
       tabindex="0"
       transition:fade={{ duration: 200 }}></div>
  
  <!-- Sidebar -->
  <div class="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white dark:bg-gray-900 shadow-lg z-50 lg:hidden"
       transition:fly={{ x: 320, duration: 300 }}>
    <div class="flex flex-col h-full">
      <!-- Sidebar Header -->
      <div class="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-lg font-semibold">Menu</h2>
        <button on:click={closeSidebar} 
                class="cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                aria-label="Close menu">
          <X size={24} />
        </button>
      </div>
      
      <!-- Sidebar Content -->
      <div class="flex flex-col flex-1 p-6 space-y-6">
        <!-- Navigation Links -->
        <div class="space-y-4">
          <a href="/" 
             on:click={closeSidebar}
             class="block text-lg py-3 px-4 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            Home
          </a>
          <button bind:this={workingOnButtonEl}
                  on:click={() => { handleWorkingModalToggle(); closeSidebar(); }}
                  data-text-primary
                  class="block w-full text-left text-lg py-3 px-4 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer">
            Currently Working On
          </button>
        </div>
        
        <!-- Divider -->
        <div class="border-t border-gray-200 dark:border-gray-700"></div>
        
        <!-- Action Buttons -->
        <div class="space-y-4">
          <button on:click={() => { handleConsoleToggle(); closeSidebar(); }} 
                  class="flex items-center w-full text-left data-text-primary text-lg py-3 px-4 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer">
            [G] Console
          </button>
          
          <button on:click={toggleTheme} 
                  class="flex items-center gap-3 w-full text-left py-3 px-4 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer {$isDarkMode ? 'text-yellow-400' : 'text-gray-800'}">
            {#if $isDarkMode}
              <Sun size={24} />
              <span>Light Mode</span>
            {:else}
              <Moon size={24} />
              <span>Dark Mode</span>
            {/if}
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}
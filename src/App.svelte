<script>
  import { Music, Sun, Moon } from 'lucide-svelte';
  import { writable } from 'svelte/store';
  
  // Create a store for dark mode
  const darkMode = writable(false);
  
  const projects = {
    left: [
      'Aastha Cooperative',
      'Niva Craftworks',
      'Deshna IT',
      'Everest Ledger',
      'IBM Nepal'
    ],
    right: [
      'Husky App',
      'Nepal Police'
    ]
  };

  // Toggle function
  function toggleDarkMode() {
    darkMode.update(value => !value);
  }
</script>

<div class="min-h-screen transition-colors duration-200 {$darkMode ? 'bg-gray-900' : 'bg-[url(\'/Gradient.svg\')] bg-cover bg-center'}">
  <div class="max-w-7xl mx-auto px-4 py-8">
    <!-- Navigation -->
    <nav class="flex justify-between items-center mb-16 mt-12">
      <div class="flex gap-28">
        <a href="/" class="text-gray-600 hover:text-gray-900 dark:text-gray-100 dark:hover:text-white text-lg">Home</a>
        <a href="/intro" class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-lg">Intro</a>
        <a href="/work" class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-lg">Currently Working On</a>
      </div>
      <div class="flex items-center gap-8">
        <button 
          on:click={toggleDarkMode} 
          class="text-yellow-400 dark:text-blue-400 cursor-pointer"
        >
          {#if $darkMode}
            <Moon size={30} />
          {:else}
            <Sun size={30} />
          {/if}
        </button>
        <span class="text-gray-600 dark:text-gray-400 text-lg">[G] Console</span>
        <span class="text-gray-600 dark:text-gray-400">
          <Music size={24} />
        </span>
      </div>
    </nav>

    <!-- Main Content -->
    <main>
      <h1 class="text-2xl tracking-tight mb-4 dark:text-white">Full Stack Developer</h1>
      <p class="text-gray-600 dark:text-gray-400 mb-2 text-[1.1rem]">
        Building robust digital experiences with passion and precision.
      </p>
      <p class="text-gray-600 dark:text-gray-400 mb-4 text-[1.1rem]">
        — I'm [ Niraj Prajapati ], a full-stack developer dedicated to crafting seamless, high-performing web applications that make an impact.
      </p>
      <p class="text-gray-600 dark:text-gray-400 mb-6 text-[1.1rem]">
        Let's connect—feel free to reach out via <a href="mailto:email@example.com" class="underline">email</a> or book a call.
      </p>

      <!-- Social Links -->
      <div class="flex gap-4 mb-12">
        <a href="https://github.com" class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
          <!-- GitHub SVG remains the same -->
        </a>
        <a href="https://linkedin.com" class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
          <!-- LinkedIn SVG remains the same -->
        </a>
      </div>

      <!-- Projects Grid -->
      <div class="flex flex-row justify-end gap-x-40 gap-y-10 text-[1.1rem]">
        <div class="space-y-4">
          {#each projects.left as project}
            <div class="text-gray-600 dark:text-gray-400 underline underline-offset-4">{project}</div>
          {/each}
        </div>
        <div class="space-y-4">
          {#each projects.right as project}
            <div class="text-gray-600 dark:text-gray-400 underline underline-offset-4">{project}</div>
          {/each}
        </div>
      </div>
    </main>
  </div>
</div>

<style global>
  :global(*) {
    font-family: 'Space Grotesk', sans-serif !important;
  }
</style>
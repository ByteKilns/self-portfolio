<script lang="ts">
  import { Music, Sun, Moon } from 'lucide-svelte';
  import { writable } from 'svelte/store';
  import ProjectsModal from './components/ProjectsModal/ProjectsModal.svelte';
  import HeroContent from './components/HeroContent/HeroContent.svelte';
  import ProjectGrid from './components/ProjectGrid/ProjectGrid.svelte';
  import type { Project } from './types/types';
  import { Globe } from 'lucide-svelte';
  import { projects } from './data/project-data';
  import ConsoleComponent from './components/ConsoleComponent/ConsoleComponent.svelte';
  import ConsoleContent from './components/ConsoleContent/ConsoleContent.svelte';
  import type { Box } from './types/types';
  import WorkingOnModal from './components/WorkingOnModal/WorkingOnModal.svelte';
  import WorkingOnModalContent from './components/WorkingOnModalContent/WorkingOnModalContent.svelte';
  import { onMount, onDestroy } from 'svelte';

  const isModalOpen = writable(false);
  const isWorkingModalOpen = writable(false);
  const isDarkMode = writable(false);
  const isConsoleOpen = writable(false);
  let workingOnButtonEl: HTMLElement;
  let workingOnButtonPosition = { x: 0, y: 0, width: 0 };

  const selectedProject = writable(projects[0]);

  const isLoadingBackground = writable(true);

  // New reactive variable for the background style
  let backgroundStyle: string = '';
  let mainContentEl: HTMLElement;

  function handleProjectClick() {
    $isModalOpen = true;
  }

  function closeModal() {
    $isModalOpen = false;
  }

  function handleConsoleToggle() {
    $isConsoleOpen = !$isConsoleOpen;
  }

  function handleWorkingModalToggle() {
    if (!$isWorkingModalOpen) {
      const rect = workingOnButtonEl.getBoundingClientRect();
      workingOnButtonPosition = {
        x: rect.left,
        y: rect.bottom,
        width: rect.width
      };
    }
    $isWorkingModalOpen = !$isWorkingModalOpen;
  }

  function handleConsoleClose() {
    $isConsoleOpen = false;
  }

  function handleProjectSelect(project: Project) {
    $selectedProject = project;
  }

  function toggleTheme() {
    $isDarkMode = !$isDarkMode;
    document.documentElement.classList.toggle('dark');
    // Update background style immediately when theme changes
    applyBackgroundStyle($isDarkMode);
  }

  // Function to apply the background style and ensure it's rendered
  function applyBackgroundStyle(darkMode: boolean) {
    const newStyle = `background-image: url('${darkMode ? '/Gradient-dark.svg' : '/Gradient.svg'}'); background-size: cover; background-position: center;`;
    backgroundStyle = newStyle;
    
    // Force a reflow to ensure the style is applied
    if (mainContentEl) {
      mainContentEl.offsetHeight; // Force reflow
    }
  }

  // --- Image and Page loading logic ---
  let loadTimeout: number;
  let bgImageLoadedCount = 0;
  const totalBgImages = 2; // For both dark and light themes
  let imagesFullyLoaded = false;
  let pageFullyLoaded = false;

  onMount(() => {
    // 1. Preload both background images
    const lightBgImage = new Image();
    const darkBgImage = new Image();

    const checkBgImagesLoaded = () => {
      bgImageLoadedCount++;
      if (bgImageLoadedCount === totalBgImages) {
        imagesFullyLoaded = true;
        // Apply initial background immediately after images are loaded
        applyBackgroundStyle($isDarkMode);
        
        // Check if we can hide loading screen
        checkCanHideLoader();
      }
    };

    lightBgImage.onload = checkBgImagesLoaded;
    darkBgImage.onload = checkBgImagesLoaded;
    lightBgImage.onerror = () => {
      console.warn('Failed to load light background image');
      checkBgImagesLoaded();
    };
    darkBgImage.onerror = () => {
      console.warn('Failed to load dark background image');
      checkBgImagesLoaded();
    };

    // Start loading images
    lightBgImage.src = '/Gradient.svg';
    darkBgImage.src = '/Gradient-dark.svg';

    // 2. Wait for full page load
    const handlePageLoad = () => {
      pageFullyLoaded = true;
      checkCanHideLoader();
    };

    // Check if page is already loaded
    if (document.readyState === 'complete') {
      handlePageLoad();
    } else {
      window.addEventListener('load', handlePageLoad);
    }

    // 3. Function to check if we can hide the loader
    const checkCanHideLoader = () => {
      if (imagesFullyLoaded && pageFullyLoaded) {
        // Add a small delay to ensure rendering is complete
        setTimeout(() => {
          // Double-check that the background is actually applied
          if (mainContentEl && backgroundStyle) {
            const computedStyle = window.getComputedStyle(mainContentEl);
            const bgImage = computedStyle.backgroundImage;
            
            // Only hide loader if background image is actually applied
            if (bgImage && bgImage !== 'none') {
              $isLoadingBackground = false;
            } else {
              // Retry after a short delay
              setTimeout(() => {
                $isLoadingBackground = false;
              }, 200);
            }
          } else {
            $isLoadingBackground = false;
          }
        }, 150); // Increased delay for better reliability
      }
    };

    // 4. Fallback timeout
    loadTimeout = setTimeout(() => {
      if ($isLoadingBackground) {
        console.warn("Loading screen hidden by fallback timeout. Some resources might still be loading.");
        // Ensure background is applied before hiding loader
        applyBackgroundStyle($isDarkMode);
        setTimeout(() => {
          $isLoadingBackground = false;
        }, 100);
      }
    }, 8000); // Increased fallback timeout

    // Cleanup
    onDestroy(() => {
      window.removeEventListener('load', handlePageLoad);
      clearTimeout(loadTimeout);
    });
  });
  // --- End image loading logic ---

  // Initial boxes with TypeScript typing
  let box: Box = {
    id: "box1",
    x: 650,
    y: 100,
    width: 600,
    height: 400,
    bgColor: "bg-blue-50",
    borderColor: "border-blue-300",
    content: {
      title: "Chat with Me",
      description: "",
      titleColor: "text-blue-700"
    },
    zIndex: 1
  };

  // Track the active box to bring it to front
  let activeBoxId: string | null = null;

  // Event handlers with TypeScript typing
  function handleDrag(boxId: string, event: CustomEvent<{ x: number, y: number }>): void {
    box.x = event.detail.x;
    box.y = event.detail.y;
    box = box; // Trigger reactivity
  }

  function handleResize(boxId: string, event: CustomEvent<{ width: number, height: number, x: number, y: number }>): void {
    box.width = event.detail.width;
    box.height = event.detail.height;
    box.x = event.detail.x;
    box.y = event.detail.y;
    box = box; // Trigger reactivity
  }

  function activateBox(boxId: string): void {
    activeBoxId = boxId;
    box = {
      ...box, zIndex: box.id === boxId ? 10 : 1
    }
  }
</script>

{#if $isLoadingBackground}
  <div class="fixed inset-0 flex items-center justify-center bg-gray-900 text-white z-50 transition-opacity duration-500 opacity-100">
    <p class="text-2xl font-bold animate-pulse">Loading...</p>
  </div>
{/if}

<div bind:this={mainContentEl}
     class="font-space-grotesk min-h-screen bg-cover bg-center main-content-wrapper transition-opacity duration-500"
     style={backgroundStyle}
     class:opacity-0={$isLoadingBackground}
     class:opacity-100={!$isLoadingBackground}
   >
  <div class="max-w-7xl mx-auto px-4 py-4">
    <nav class="flex justify-between items-center mb-16 mt-12">
      <div class="flex gap-24">
        <a href="/" class="text-lg">Home</a>
        <button bind:this={workingOnButtonEl}
                on:click={handleWorkingModalToggle}
                data-text-primary
                class="text-lg cursor-pointer">Currently Working On</button>
      </div>
      <div class="flex items-center gap-8">
        <button on:click={toggleTheme} class="curor-pointer {$isDarkMode ? 'text-yellow-400 hover:text-yellow-300' : 'text-gray-800 hover:text-gray-600'}">
          {#if $isDarkMode}
            <Sun size={30} />
          {:else}
            <Moon size={24} />
          {/if}
        </button>
        <button on:click={handleConsoleToggle} class="data-text-primary text-lg cursor-pointer">[G] Console</button>
      </div>
    </nav>

    <main>
      <HeroContent {isDarkMode}/>

      <ProjectGrid
              {projects}
              onProjectSelect={handleProjectSelect}
              onProjectClick={handleProjectClick}
      />
      <ProjectsModal {isDarkMode} isOpen={$isModalOpen} onClose={closeModal} project={$selectedProject}>
        <section class="flex  items-start gap-4">
          <div data-text-primary class="text-xl font-medium mb-4">{$selectedProject.title || "Project Details"}</div>
          <div data-text-primary class="flex gap-4">
            <a aria-label="github link" href="https://github.com/nirjalpraj" target="_blank" >
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            </a>
            {#if $selectedProject.isLinkAvailable}
              <Globe data-text-primary class="" />
            {:else}
              <span>[ Link not available currently ]</span>
            {/if}
          </div>
        </section>
        <section class="flex flex-row justify-between">
          <div>
            {#if $selectedProject.description}
              <p class="mb-4">
                <ul data-text-primary class="list-disc pl-5  ">
                  {#each $selectedProject.description as desc}
                    <li>{desc}</li>
                  {/each}
                </ul>
              <div class="mt-4">
                <h3 class="{$isDarkMode ? "text-gray-100 hover:text-gray-300" :  "text-gray-900 hover:text-gray-800"} underline underline-offset-4   font-medium mb-2">Tech Stack</h3>
                <ul data-text-primary class="list-disc pl-5 ">
                  {#each $selectedProject.TechStack as tech}
                    <li>{tech}</li>
                  {/each}
                </ul>
              </div>
            {:else}
              <p class="">No project selected.</p>
            {/if}
          </div>
          <div>
            <img src={$selectedProject.photoUrl} alt="Project Image" class="w-full h-[25rem]" />
          </div>
        </section>
      </ProjectsModal>

      <WorkingOnModal isOpen={$isWorkingModalOpen}
                      onClose={handleWorkingModalToggle}
                      anchorPosition={workingOnButtonPosition}
                      {isDarkMode}>
        <WorkingOnModalContent />
      </WorkingOnModal>

      {#if $isConsoleOpen}
        <ConsoleComponent
            x={box.x}
            y={box.y}
            width={box.width}
            height={box.height}
                minWidth={150}
                minHeight={100}
                containerId="container"
                bgColor={box.bgColor}
                borderColor={box.borderColor}
                zIndex={box.zIndex}
                on:mousedown={() => activateBox(box.id)}
                on:touchstart={() => activateBox(box.id)}
                on:drag={(e) => handleDrag(box.id, e)}
                on:resize={(e) => handleResize(box.id, e)}
                onClose={handleConsoleClose}
        >
          <ConsoleContent
                  box={box}
          />

        </ConsoleComponent>
      {/if}
    </main>
  </div>
</div>
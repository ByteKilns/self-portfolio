<script lang="ts">
  import { Music, Sun } from 'lucide-svelte';
  import { writable } from 'svelte/store';
  import ProjectsModal from './components/ProjectsModal/ProjectsModal.svelte';
  import HeroContent from './components/HeroContent/HeroContent.svelte';
  import ProjectGrid from './components/ProjectGrid/ProjectGrid.svelte';
  import type { Project } from './types/types';
  import { Globe } from 'lucide-svelte';
  import { projects } from './data/project-data'; 

  const currentNav = writable('home');
  const isModalOpen = writable(false);

 
const selectedProject = writable(projects[0]);

  function handleProjectClick() {
    $isModalOpen = true;
  }

  function closeModal() {
    $isModalOpen = false;
  }

  function handleProjectSelect(project: Project) {
    $selectedProject = project;
  }
</script>
<svelte:head>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&display=swap" rel="stylesheet">
</svelte:head>

<div class="font-space-grotesk min-h-screen bg-[url('/Gradient.svg')] bg-cover bg-center">
  <div class="max-w-7xl mx-auto px-4 py-4">
    <!-- Navigation -->
    <nav class="flex justify-between items-center mb-16 mt-12">
      <div class="flex gap-28">
        <a href="/" class="text-gray-600 hover:text-gray-900 text-lg">Home</a>
        <a href="/intro" class="text-gray-600 hover:text-gray-900 text-lg">Intro</a>
        <a href="/work" class="text-gray-600 hover:text-gray-900 text-lg">Currently Working On</a>
      </div>
      <div class="flex items-center gap-8">
        <span class="text-yellow-400">
          <Sun size={30} />
        </span>
        <span class="text-gray-600 text-lg">[G] Console</span>
        <span class="text-gray-600">
          <Music size={24} />
        </span>
      </div>
    </nav>

    <!-- Main Content -->
    <main>
      <h1 class="text-2xl tracking-tight mb-4">Full Stack Developer</h1>
      <HeroContent/>

     
     <ProjectGrid
     {projects}
     onProjectSelect={handleProjectSelect}
     onProjectClick={handleProjectClick}
   />
      <ProjectsModal isOpen={$isModalOpen} onClose={closeModal} project={$selectedProject}>
        <section class="flex  items-start gap-4">
          <div class="text-xl font-semibold mb-4">{$selectedProject.title || "Project Details"}</div>
          <div class="flex gap-4">
            <a aria-label="github link" href="https://github.com/nirjalpraj" target="_blank" class="text-gray-600 hover:text-gray-900">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            </a>
            <Globe class="text-gray-600" />
        </section>
        <section class="flex flex-row justify-between">
          <div>
            {#if $selectedProject.description}
              <p class="text-gray-600 mb-4">
                <ul class="list-disc pl-5 text-gray-600">
                  {#each $selectedProject.description as desc}
                    <li>{desc}</li>
                  {/each}
                </ul>
              <div class="mt-4">
                <h3 class="text-gray-800 font-medium mb-2">Tech Stack</h3>
                <ul class="list-disc pl-5 text-gray-600">
                  {#each $selectedProject.TechStack as tech}
                    <li>{tech}</li>
                  {/each}
                </ul>
              </div>
            {:else}
              <p class="text-gray-600">No project selected.</p>
            {/if}
          </div>
          <div>
            <img src={$selectedProject.photoUrl} alt="Project Image" class="w-full h-[25rem]" />
          </div>
        </section>
      </ProjectsModal>
    </main>
  </div>
</div>
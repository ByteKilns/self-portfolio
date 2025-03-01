<script lang="ts">
  import { Music, Sun } from 'lucide-svelte';
  import { writable } from 'svelte/store';
  import ProjectsModal from './components/ProjectsModal/ProjectsModal.svelte';
  import type { Project } from './types/types';
  import { Globe } from 'lucide-svelte';
  import { projects } from './data/project-data'; // Adjust the path as needed

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

<div class="font-sans min-h-screen bg-[url('/Gradient.svg')] bg-cover bg-center">
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
      <p class="text-gray-600 mb-2 text-[1.1rem]">
        Building robust digital experiences with passion and precision.
      </p>
      <p class="text-gray-600 mb-4 text-[1.1rem]">
        — I'm [ Nirjal Prajapati ], a full-stack developer dedicated to crafting seamless, high-performing web applications that make an impact.
      </p>
      <p class="text-gray-600 mb-6 text-[1.1rem]">
        Let's connect—feel free to reach out via <a href="mailto:nirjalprajapati@gmail.com" class="underline">email</a>  </p>

      <!-- Social Links -->
      <div class="flex gap-4 mb-12">
        <a aria-label="github link" href="https://github.com/nirjalpraj" target="_blank" class="text-gray-600 hover:text-gray-900">
          <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
        </a>
        <a aria-label="linked profile link" href="https://www.linkedin.com/in/nirjal-prajapati-b343a11a5/" target="_blank" class="text-gray-600 hover:text-gray-900">
          <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        </a>
      </div>

      <!-- Projects Grid -->
     <div class="flex flex-row justify-end gap-x-40 gap-y-10 text-[1.1rem]">
  <div class="flex flex-col items-end space-y-5">
    {#each projects.filter((project) => project.position === "left") as project}
      <button
        type="button"
        class="text-gray-600 underline underline-offset-4 cursor-pointer"
        on:click={() => {
          handleProjectSelect(project);
          handleProjectClick();
        }}
      >
        {project.title}
      </button>
    {/each}
  </div>
  <div class="flex flex-col items-end space-y-5">
    {#each projects.filter((project) => project.position === "right") as project}
      <button
        type="button"
        class="text-gray-600 underline underline-offset-4 cursor-pointer"
        on:click={() => {
          handleProjectSelect(project);
          handleProjectClick();
        }}
      >
        {project.title}
      </button>
    {/each}
  </div>
</div>
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
      </ProjectsModal>
    </main>
  </div>
</div>
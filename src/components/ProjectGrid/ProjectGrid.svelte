<script lang="ts">
    import type { Project } from '../../types/types.ts'; 
    export let projects: Project[];
    export let onProjectSelect: (project: Project) => void;
    export let onProjectClick: () => void;
  
    const leftProjects = projects.filter(project => project.position === "left");
    const rightProjects = projects.filter(project => project.position === "right");
  </script>
  
  <div class="flex flex-col md:flex-row justify-end gap-x-40 gap-y-10 text-[1.1rem] data-text-primary ">
    <div class="flex flex-col items-end space-y-5">
      {#each leftProjects as project}
        <button
          type="button"
          class=" underline underline-offset-4 cursor-pointer"
          on:click={() => {
            onProjectSelect(project);
            onProjectClick();
          }}
        >
          {project.title}
        </button>
      {/each}
    </div>
    <div class="flex flex-col items-end space-y-5">
      {#each rightProjects as project}
        <button
          type="button"
          class=" underline underline-offset-4 cursor-pointer"
          on:click={() => {
            onProjectSelect(project);
            onProjectClick();
          }}
        >
          {project.title}
        </button>
      {/each}
    </div>
  </div>
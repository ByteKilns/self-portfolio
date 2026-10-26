import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [
    sveltekit({
      adapter: adapter({ runtime: 'nodejs22.x' }),
      preprocess: vitePreprocess()
    })
  ],
  test: {
    include: ['src/**/*.test.ts']
  }
});

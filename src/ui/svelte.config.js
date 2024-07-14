import { defineConfig } from 'vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  preprocess: vitePreprocess(),
});

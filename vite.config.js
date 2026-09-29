import { defineConfig } from 'vite';

// Base path pour GitHub Pages : /<nom-du-repo>/
export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/mb-voyage-site/' : './',
});

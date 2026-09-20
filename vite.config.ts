import { defineConfig, type UserConfig } from 'vite';

const config: UserConfig = {
  // GitHub Pages publishes this project at https://romasho.github.io/minigames/.
  // Vite needs the repository path to generate correct asset URLs in production.
  base: '/minigames/',
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  server: {
    open: true,
    port: 5173,
  },
};

export default defineConfig(config);

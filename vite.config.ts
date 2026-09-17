import { defineConfig, type UserConfig } from 'vite';

const config: UserConfig = {
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

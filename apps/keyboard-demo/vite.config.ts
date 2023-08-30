import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  cacheDir: '../../../node_modules/.vite/keyboard-demo',
  plugins: [tsconfigPaths()],
  build: { outDir: '../../../dist/apps/keyboard-demo' },
  server: { port: 4000 },
});

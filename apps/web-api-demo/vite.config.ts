import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  cacheDir: '../../../node_modules/.vite/web-api-demo',
  plugins: [tsconfigPaths()],
  build: { outDir: '../../../dist/apps/web-api-demo' },
});

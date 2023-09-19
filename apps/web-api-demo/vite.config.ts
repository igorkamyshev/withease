import { defineConfig } from 'vite';
import nxViteTsPaths from 'vite-tsconfig-paths';

export default defineConfig({
  cacheDir: '../../../node_modules/.vite/web-api-demo',
  plugins: [nxViteTsPaths()],
  build: { outDir: '../../../dist/apps/web-api-demo' },
});

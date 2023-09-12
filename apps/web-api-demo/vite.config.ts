import { defineConfig } from 'vite';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig({
  cacheDir: '../../../node_modules/.vite/web-api-demo',
  plugins: [nxViteTsPaths()],
  build: { outDir: '../../../dist/apps/web-api-demo' },
});

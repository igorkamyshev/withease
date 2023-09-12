import { defineConfig } from 'vitest/config';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig({
  test: {
    typecheck: {
      ignoreSourceErrors: true,
    },
  },
  plugins: [nxViteTsPaths()],
});

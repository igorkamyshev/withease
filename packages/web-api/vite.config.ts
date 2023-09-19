import { defineConfig } from 'vitest/config';
import nxViteTsPaths from 'vite-tsconfig-paths';

export default defineConfig({
  test: { typecheck: { ignoreSourceErrors: true } },
  plugins: [nxViteTsPaths()],
});

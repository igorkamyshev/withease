import tsconfigPaths from 'vite-tsconfig-paths';
import dts from '../../tools/vite/types';

export default {
  test: {
    typecheck: {
      ignoreSourceErrors: true,
    },
  },
  plugins: [tsconfigPaths(), dts()],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: '@withease/i18next',
      fileName: 'i18next',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['effector', 'i18next'],
    },
  },
};

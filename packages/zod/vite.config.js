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
      name: '@withease/zod',
      fileName: 'zod',
      formats: ['es', 'cjs'],
    },
  },
};

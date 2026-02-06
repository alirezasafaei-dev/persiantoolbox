import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'shared/utils/index.ts',
    numbers: 'shared/utils/numbers/index.ts',
    localization: 'shared/utils/localization/index.ts',
    validation: 'shared/utils/validation/index.ts',
    finance: 'shared/utils/finance.ts',
    'date-tools': 'shared/utils/date-tools.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  tsconfig: 'tsconfig.build.json',
  target: 'es2022',
  sourcemap: true,
  clean: true,
  outDir: 'dist',
  splitting: true,
  treeshake: 'smallest',
  shims: true,
  minify: false,
  external: ['react', 'react-dom', 'next'],
});

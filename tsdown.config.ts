import { defineConfig } from 'tsdown';

export default defineConfig({
  workspace: true,
  entry: {
    bin: 'cli/index.ts',
    index: 'lib/index.ts',
  },
  dts: true,
  sourcemap: true,
  exports: true,
  publint: 'ci-only',
  attw: {
    enabled: 'ci-only',
    profile: 'esm-only',
  },
  outputOptions: {
    banner: (chunk) => {
      if (chunk.name === 'bin') {
        return '#!/usr/bin/env node';
      }
      return '';
    },
  },
});

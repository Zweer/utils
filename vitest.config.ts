import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary'],
      include: ['packages/**/{cli,lib}/**/*.ts'],
      exclude: ['**/test/**/*', 'packages/**/lib/**/index.ts', 'packages/**/lib/**/types.ts'],
    },
  },
});

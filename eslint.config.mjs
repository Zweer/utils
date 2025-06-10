import antfu from '@antfu/eslint-config';

export default antfu({
  stylistic: {
    semi: true,
    overrides: {
      'style/brace-style': ['error', '1tbs'],
      'no-console': 'off',
    },
  },
  typescript: {
    tsconfigPath: 'tsconfig.json',
  },
}, {
  rules: {
    'perfectionist/sort-imports': ['error', {
      internalPattern: ['^~/.+', '^@/.+', '^#.+'],
      groups: [
        'type',
        ['parent-type', 'sibling-type', 'index-type', 'internal-type'],
        'builtin',
        'external',
        'internal',
        ['parent', 'sibling', 'index'],
        'side-effect',
        'object',
        'unknown',
      ],
    }],
  },
}, {
  rules: {
    'ts/no-unsafe-argument': 'off',
    'ts/no-unsafe-assignment': 'off',
    'ts/no-unsafe-call': 'off',
    'ts/no-unsafe-member-access': 'off',
    'ts/no-unsafe-return': 'off',
  },
  files: [
    'packages/coverage-badge-readme/cli/**/*',
    'packages/coverage-badge-readme/test/cli/**/*',
  ],
});

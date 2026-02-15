import path from 'node:path';

import { describe, expect, it, vi } from 'vitest';

import { createFileTree } from '../../lib/createTree.js';

describe('createTree', () => {
  it('should return an empty string for an empty input array', () => {
    expect(createFileTree([])).toBe('');
  });

  it('should generate a correct tree for a typical project structure with Unix paths', () => {
    const files = [
      '/home/user/project/.gitignore',
      '/home/user/project/README.md',
      '/home/user/project/package.json',
      '/home/user/project/src/index.ts',
      '/home/user/project/src/utils/helpers.ts',
    ];

    const expectedTree = `project
├── .gitignore
├── README.md
├── package.json
└── src
    ├── index.ts
    └── utils
        └── helpers.ts
`;

    expect(createFileTree(files)).toBe(expectedTree);
  });

  it('should work correctly with Windows-style path separators', () => {
    const spy = vi.spyOn(path, 'sep', 'get').mockReturnValue('\\');

    const files = [
      'C:\\Users\\Test\\project\\src\\index.ts',
      'C:\\Users\\Test\\project\\src\\components\\Button.tsx',
      'C:\\Users\\Test\\project\\package.json',
    ];

    const expectedTree = `project
├── package.json
└── src
    ├── components
    │   └── Button.tsx
    └── index.ts
`;

    expect(createFileTree(files)).toBe(expectedTree);

    spy.mockRestore();
  });

  it('should correctly render deeply nested structures', () => {
    const files = [
      '/app/src/api/routes/user.js',
      '/app/src/api/routes/post.js',
      '/app/src/config/database.js',
      '/app/src/index.js',
      '/app/README.md',
    ];

    const expectedTree = `app
├── README.md
└── src
    ├── api
    │   └── routes
    │       ├── post.js
    │       └── user.js
    ├── config
    │   └── database.js
    └── index.js
`;

    expect(createFileTree(files)).toBe(expectedTree);
  });

  it('should handle a single file path correctly', () => {
    const files = ['/var/log/system.log'];

    const expectedTree = `log
└── system.log
`;

    expect(createFileTree(files)).toBe(expectedTree);
  });

  it('should handle files directly in the common root directory', () => {
    const files = ['/project/src/index.js', '/project/main.js'];

    const expectedTree = `project
├── main.js
└── src
    └── index.js
`;

    expect(createFileTree(files)).toBe(expectedTree);
  });
});

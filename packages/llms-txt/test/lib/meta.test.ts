import { vol } from 'memfs';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { readProjectMeta } from '../../lib/meta.js';

const rootDir = '/fake/root';

vi.mock('node:fs', async () => {
  const { fs } = await import('memfs');

  return {
    default: fs,
    ...fs,
  };
});

describe('lib -> meta', () => {
  afterEach(() => {
    vol.reset();
  });

  it('should read name and description from package.json', () => {
    vol.fromJSON({
      [`${rootDir}/package.json`]: JSON.stringify({
        name: '@zweer/my-project',
        description: 'A cool project',
      }),
    });

    const meta = readProjectMeta(rootDir);

    expect(meta.name).toBe('my-project');
    expect(meta.description).toBe('A cool project');
  });

  it('should strip scope from package name', () => {
    vol.fromJSON({
      [`${rootDir}/package.json`]: JSON.stringify({ name: '@scope/pkg' }),
    });

    expect(readProjectMeta(rootDir).name).toBe('pkg');
  });

  it('should handle unscoped package name', () => {
    vol.fromJSON({
      [`${rootDir}/package.json`]: JSON.stringify({ name: 'my-pkg' }),
    });

    expect(readProjectMeta(rootDir).name).toBe('my-pkg');
  });

  it('should derive GitHub Pages URL from repository.url string', () => {
    vol.fromJSON({
      [`${rootDir}/package.json`]: JSON.stringify({
        name: 'test',
        repository: 'https://github.com/Zweer/utils',
      }),
    });

    expect(readProjectMeta(rootDir).siteUrl).toBe('https://zweer.github.io/utils');
  });

  it('should derive GitHub Pages URL from repository.url object', () => {
    vol.fromJSON({
      [`${rootDir}/package.json`]: JSON.stringify({
        name: 'test',
        repository: { type: 'git', url: 'git+https://github.com/Zweer/bonvoy.git' },
      }),
    });

    expect(readProjectMeta(rootDir).siteUrl).toBe('https://zweer.github.io/bonvoy');
  });

  it('should return empty siteUrl for non-GitHub repos', () => {
    vol.fromJSON({
      [`${rootDir}/package.json`]: JSON.stringify({
        name: 'test',
        repository: { url: 'https://gitlab.com/user/repo.git' },
      }),
    });

    expect(readProjectMeta(rootDir).siteUrl).toBe('');
  });

  it('should handle missing fields gracefully', () => {
    vol.fromJSON({
      [`${rootDir}/package.json`]: JSON.stringify({}),
    });

    const meta = readProjectMeta(rootDir);

    expect(meta.name).toBe('');
    expect(meta.description).toBe('');
    expect(meta.siteUrl).toBe('');
  });
});

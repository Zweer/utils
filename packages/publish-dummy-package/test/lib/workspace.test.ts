import { vol } from 'memfs';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { discoverWorkspacePackages, resolveWorkspaces } from '../../lib/workspace.js';

const rootPath = '/fake/root/path';

vi.mock('node:fs', async () => {
  const { fs } = await import('memfs');

  return {
    default: fs,
    ...fs,
  };
});

describe('lib -> workspace', () => {
  afterEach(() => {
    vol.reset();
  });

  describe('resolveWorkspaces', () => {
    it('should resolve glob patterns from workspaces array', () => {
      vol.fromNestedJSON({
        [rootPath]: {
          'package.json': JSON.stringify({ workspaces: ['packages/*'] }),
          packages: {
            'pkg-a': { 'package.json': '{}' },
            'pkg-b': { 'package.json': '{}' },
          },
        },
      });

      const dirs = resolveWorkspaces(rootPath);

      expect(dirs).toEqual([`${rootPath}/packages/pkg-a`, `${rootPath}/packages/pkg-b`]);
    });

    it('should resolve workspaces.packages object format', () => {
      vol.fromNestedJSON({
        [rootPath]: {
          'package.json': JSON.stringify({ workspaces: { packages: ['libs/*'] } }),
          libs: {
            'lib-a': { 'package.json': '{}' },
          },
        },
      });

      const dirs = resolveWorkspaces(rootPath);

      expect(dirs).toEqual([`${rootPath}/libs/lib-a`]);
    });

    it('should resolve direct paths without globs', () => {
      vol.fromNestedJSON({
        [rootPath]: {
          'package.json': JSON.stringify({ workspaces: ['tools/cli', 'tools/core'] }),
          tools: {
            cli: { 'package.json': '{}' },
            core: { 'package.json': '{}' },
          },
        },
      });

      const dirs = resolveWorkspaces(rootPath);

      expect(dirs).toEqual([`${rootPath}/tools/cli`, `${rootPath}/tools/core`]);
    });

    it('should handle multiple workspace patterns', () => {
      vol.fromNestedJSON({
        [rootPath]: {
          'package.json': JSON.stringify({ workspaces: ['packages/*', 'apps/*'] }),
          packages: { 'pkg-a': { 'package.json': '{}' } },
          apps: { 'app-a': { 'package.json': '{}' } },
        },
      });

      const dirs = resolveWorkspaces(rootPath);

      expect(dirs).toEqual([`${rootPath}/packages/pkg-a`, `${rootPath}/apps/app-a`]);
    });

    it('should skip non-existent glob directories', () => {
      vol.fromNestedJSON({
        [rootPath]: {
          'package.json': JSON.stringify({ workspaces: ['packages/*', 'missing/*'] }),
          packages: { 'pkg-a': { 'package.json': '{}' } },
        },
      });

      const dirs = resolveWorkspaces(rootPath);

      expect(dirs).toEqual([`${rootPath}/packages/pkg-a`]);
    });

    it('should throw when no workspaces field exists', () => {
      vol.fromJSON({
        [`${rootPath}/package.json`]: JSON.stringify({ name: 'test' }),
      });

      expect(() => resolveWorkspaces(rootPath)).toThrow('No workspaces found in package.json');
    });
  });

  describe('discoverWorkspacePackages', () => {
    it('should read package info from directories', () => {
      vol.fromNestedJSON({
        [rootPath]: {
          packages: {
            'pkg-a': {
              'package.json': JSON.stringify({ name: '@zweer/pkg-a', version: '1.0.0' }),
            },
            'pkg-b': {
              'package.json': JSON.stringify({ name: '@zweer/pkg-b', version: '2.0.0' }),
            },
          },
        },
      });

      const packages = discoverWorkspacePackages([
        `${rootPath}/packages/pkg-a`,
        `${rootPath}/packages/pkg-b`,
      ]);

      expect(packages).toEqual([
        {
          name: '@zweer/pkg-a',
          version: '1.0.0',
          path: `${rootPath}/packages/pkg-a`,
          private: false,
        },
        {
          name: '@zweer/pkg-b',
          version: '2.0.0',
          path: `${rootPath}/packages/pkg-b`,
          private: false,
        },
      ]);
    });

    it('should detect private packages', () => {
      vol.fromNestedJSON({
        [rootPath]: {
          packages: {
            'pkg-a': {
              'package.json': JSON.stringify({
                name: '@zweer/pkg-a',
                version: '1.0.0',
                private: true,
              }),
            },
          },
        },
      });

      const packages = discoverWorkspacePackages([`${rootPath}/packages/pkg-a`]);

      expect(packages[0].private).toBe(true);
    });

    it('should skip directories without valid package.json', () => {
      vol.fromNestedJSON({
        [rootPath]: {
          packages: {
            'pkg-a': {
              'package.json': JSON.stringify({ name: '@zweer/pkg-a', version: '1.0.0' }),
            },
            'no-pkg': { 'README.md': 'hello' },
          },
        },
      });

      const packages = discoverWorkspacePackages([
        `${rootPath}/packages/pkg-a`,
        `${rootPath}/packages/no-pkg`,
      ]);

      expect(packages).toHaveLength(1);
      expect(packages[0].name).toBe('@zweer/pkg-a');
    });

    it('should return empty array for empty input', () => {
      expect(discoverWorkspacePackages([])).toEqual([]);
    });
  });
});

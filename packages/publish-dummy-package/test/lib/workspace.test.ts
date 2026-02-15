import { vol } from 'memfs';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { discoverWorkspacePackages } from '../../lib/workspace.js';

const rootPath = '/fake/root/path';
const packagesDir = `${rootPath}/packages`;

vi.mock('node:fs', async () => {
  const { fs } = await import('memfs');

  return {
    default: fs,
    ...fs,
  };
});

describe('lib -> workspace', () => {
  afterEach(() => {
    vi.resetAllMocks();
    vol.reset();
  });

  it('should discover workspace packages', () => {
    vol.fromNestedJSON({
      [packagesDir]: {
        'pkg-a': {
          'package.json': JSON.stringify({ name: '@zweer/pkg-a', version: '1.0.0' }),
        },
        'pkg-b': {
          'package.json': JSON.stringify({ name: '@zweer/pkg-b', version: '2.0.0' }),
        },
      },
    });

    const packages = discoverWorkspacePackages(packagesDir);

    expect(packages).toEqual([
      { name: '@zweer/pkg-a', version: '1.0.0', path: `${packagesDir}/pkg-a`, private: false },
      { name: '@zweer/pkg-b', version: '2.0.0', path: `${packagesDir}/pkg-b`, private: false },
    ]);
  });

  it('should detect private packages', () => {
    vol.fromNestedJSON({
      [packagesDir]: {
        'pkg-a': {
          'package.json': JSON.stringify({
            name: '@zweer/pkg-a',
            version: '1.0.0',
            private: true,
          }),
        },
      },
    });

    const packages = discoverWorkspacePackages(packagesDir);

    expect(packages).toEqual([
      { name: '@zweer/pkg-a', version: '1.0.0', path: `${packagesDir}/pkg-a`, private: true },
    ]);
  });

  it('should skip directories without a valid package.json', () => {
    vol.fromNestedJSON({
      [packagesDir]: {
        'pkg-a': {
          'package.json': JSON.stringify({ name: '@zweer/pkg-a', version: '1.0.0' }),
        },
        'no-pkg': {
          'README.md': 'hello',
        },
        'bad-json': {
          'package.json': 'not json',
        },
      },
    });

    const packages = discoverWorkspacePackages(packagesDir);

    expect(packages).toEqual([
      { name: '@zweer/pkg-a', version: '1.0.0', path: `${packagesDir}/pkg-a`, private: false },
    ]);
  });

  it('should skip files (non-directories) in the packages dir', () => {
    vol.fromNestedJSON({
      [packagesDir]: {
        'pkg-a': {
          'package.json': JSON.stringify({ name: '@zweer/pkg-a', version: '1.0.0' }),
        },
        '.DS_Store': 'junk',
      },
    });

    const packages = discoverWorkspacePackages(packagesDir);

    expect(packages).toEqual([
      { name: '@zweer/pkg-a', version: '1.0.0', path: `${packagesDir}/pkg-a`, private: false },
    ]);
  });

  it('should return an empty array when no packages exist', () => {
    vol.fromNestedJSON({ [packagesDir]: {} });

    const packages = discoverWorkspacePackages(packagesDir);

    expect(packages).toEqual([]);
  });
});

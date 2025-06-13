import process from 'node:process';

import { vol } from 'memfs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { retrieveFilenames } from '../../lib/retrieveFilenames.js';

const rootPath = '/fake/root/path';

vi.mock('node:fs', async () => {
  const { fs } = await import('memfs');

  return {
    default: fs,
    ...fs,
  };
});

describe('retrieveFilenames', () => {
  beforeEach(() => {
    vol.fromNestedJSON({
      [rootPath]: {
        'package.json': '{}',
        'README.md': 'Project Readme',
        '.gitignore': ['node_modules', 'dist', '.env', '*.log'].join('\n'),
        'src': {
          'index.ts': 'console.log("hello")',
          'utils': {
            'helpers.ts': 'export const a = 1;',
          },
        },
        'dist': {
          'bundle.js': '...',
        },
        'node_modules/some-lib/index.js': '...',
        'test.log': 'some logs',
        '.env': 'SECRET=123',
      },
    });

    vi.spyOn(process, 'cwd').mockReturnValue(rootPath);
  });

  afterEach(() => {
    vi.resetAllMocks();
    vol.reset();
  });

  it('should retrieve files respecting .gitignore by default', () => {
    const files = retrieveFilenames();

    const expectedFiles = [
      '/.gitignore',
      '/README.md',
      '/package.json',
      '/src/index.ts',
      '/src/utils/helpers.ts',
    ].map(file => `${rootPath}${file}`).sort();

    expect(files).toEqual(expectedFiles);
  });

  it('should NOT use .gitignore when useGitIgnore is false', () => {
    const files = retrieveFilenames({ useGitIgnore: false, ignoreList: [] });

    const expectedFiles = [
      '/.env',
      '/.gitignore',
      '/README.md',
      '/dist/bundle.js',
      '/node_modules/some-lib/index.js',
      '/package.json',
      '/src/index.ts',
      '/src/utils/helpers.ts',
      '/test.log',
    ].map(file => `${rootPath}${file}`).sort();

    expect(files).toEqual(expectedFiles);
  });

  it('should use a custom ignoreList in addition to .gitignore', () => {
    const files = retrieveFilenames({
      ignoreList: ['README.md', '**/*.ts'],
    });

    const expectedFiles = ['/.gitignore', '/package.json'].map(file => `${rootPath}${file}`).sort();

    expect(files).toEqual(expectedFiles);
  });

  it('should only use the custom ignoreList when useGitIgnore is false', () => {
    const files = retrieveFilenames({
      useGitIgnore: false,
      ignoreList: ['package.json', 'dist/'],
    });

    const expectedFiles = [
      '/.env',
      '/.gitignore',
      '/README.md',
      '/node_modules/some-lib/index.js',
      '/src/index.ts',
      '/src/utils/helpers.ts',
      '/test.log',
    ].map(file => `${rootPath}${file}`).sort();

    expect(files).toEqual(expectedFiles);
  });

  it('should return an empty array if all files are ignored', () => {
    const files = retrieveFilenames({
      ignoreList: ['*/**', '*'],
    });

    expect(files).toEqual([]);
  });

  it('should handle an empty directory', () => {
    vol.reset();
    vol.fromNestedJSON({ [rootPath]: { '.gitignore': 'node_modules' } });

    const files = retrieveFilenames();
    expect(files).toEqual([`${rootPath}/.gitignore`]);
  });

  describe('errors', () => {
    it('should throw an error if the baseDir is not a directory', () => {
      vol.reset();
      vol.fromJSON({ 'file.txt': 'content' });

      expect(() => retrieveFilenames({ baseDir: '/file.txt' })).toThrow('InvalidBaseDir');
    });

    it('should throw an error if the baseDir does not exist', () => {
      expect(() => retrieveFilenames({ baseDir: '/nonexistent' })).toThrow('InvalidBaseDir');
    });

    it('should throw an error if no gitignore is found', () => {
      vol.reset();
      vol.fromJSON({ [`${rootPath}/file.txt`]: 'content' });

      expect(() => retrieveFilenames()).toThrow('GitIgnoreNotFound');
    });
  });
});

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
        src: {
          'index.ts': 'console.log("hello")',
          utils: {
            'helpers.ts': 'export const a = 1;',
          },
        },
        dist: {
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
    ]
      .map((file) => `${rootPath}${file}`)
      .sort();

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
    ]
      .map((file) => `${rootPath}${file}`)
      .sort();

    expect(files).toEqual(expectedFiles);
  });

  it('should use a custom ignoreList in addition to .gitignore', () => {
    const files = retrieveFilenames({
      ignoreList: ['README.md', '**/*.ts'],
    });

    const expectedFiles = ['/.gitignore', '/package.json']
      .map((file) => `${rootPath}${file}`)
      .sort();

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
    ]
      .map((file) => `${rootPath}${file}`)
      .sort();

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

  it('should use customIgnoreList to ignore specific files', () => {
    const files = retrieveFilenames({
      customIgnoreList: ['src/index.ts', 'README.md'],
    });
    const expectedFiles = ['/.gitignore', '/package.json', '/src/utils/helpers.ts']
      .map((file) => `${rootPath}${file}`)
      .sort();
    expect(files).toEqual(expectedFiles);
  });

  it('should use customIgnoreList with patterns', () => {
    const files = retrieveFilenames({
      customIgnoreList: ['src/**', '*.md'],
    });
    const expectedFiles = ['/.gitignore', '/package.json']
      .map((file) => `${rootPath}${file}`)
      .sort();
    expect(files).toEqual(expectedFiles);
  });

  it('should combine customIgnoreList with default ignoreList and .gitignore', () => {
    // .gitignore ignores: 'node_modules', 'dist', '.env', '*.log'
    // default ignoreList (from constants.ts, assuming it includes e.g. '.git/')
    // customIgnoreList ignores: 'package.json'
    // retrieveFilenames by default has `useGitIgnore: true` and uses `defaultIgnoreList`
    const files = retrieveFilenames({
      customIgnoreList: ['package.json'],
    });
    const expectedFiles = ['/.gitignore', '/README.md', '/src/index.ts', '/src/utils/helpers.ts']
      .map((file) => `${rootPath}${file}`)
      .sort();
    expect(files).toEqual(expectedFiles);
  });

  it('should use customIgnoreList even if useGitIgnore is false and ignoreList is empty', () => {
    const files = retrieveFilenames({
      useGitIgnore: false,
      ignoreList: [], // Explicitly empty the default ignore list
      customIgnoreList: ['src/index.ts', '*.md', '.env', '*.log', 'dist/**', 'node_modules/**'],
    });
    // effectively only package.json and .gitignore and src/utils/helpers.ts should remain
    const expectedFiles = ['/.gitignore', '/package.json', '/src/utils/helpers.ts']
      .map((file) => `${rootPath}${file}`)
      .sort();
    expect(files).toEqual(expectedFiles);
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

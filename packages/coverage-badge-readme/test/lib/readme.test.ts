import type { MockInstance } from 'vitest';

import * as fs from 'node:fs';

import { vol } from 'memfs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { modifyReadme } from '../../lib/readme.js';

vi.mock('node:fs', async () => {
  const { fs } = await import('memfs');

  return {
    default: fs,
    ...fs,
  };
});

const rootFolder = '/fake/root/folder';
const readmePath = `${rootFolder}/README.md`;

describe('lib -> readme', () => {
  let consoleLogSpy: MockInstance<typeof console.log>;
  let consoleWarnSpy: MockInstance<typeof console.warn>;
  let consoleErrorSpy: MockInstance<typeof console.error>;

  let existsSyncSpy: MockInstance<typeof fs.existsSync>;
  let readFileSyncSpy: MockInstance<typeof fs.readFileSync>;
  let writeFileSyncSpy: MockInstance<typeof fs.writeFileSync>;

  const readmeContent = '# title\n![Coverage Badge](https://img.shields.io/badge/coverage-100%25-brightgreen?style=flat)\nfoo';

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    existsSyncSpy = vi.spyOn(fs, 'existsSync');
    readFileSyncSpy = vi.spyOn(fs, 'readFileSync');
    writeFileSyncSpy = vi.spyOn(fs, 'writeFileSync');
  });

  afterEach(() => {
    vi.resetAllMocks();
    vol.reset();
  });

  describe('readme file available', () => {
    beforeEach(() => {
      vol.fromJSON({
        [readmePath]: readmeContent,
      });
    });

    it('should take the happy path', () => {
      expect(() => modifyReadme(readmePath, '[badge]')).not.toThrow();

      expect(existsSyncSpy).toHaveBeenCalledWith(readmePath);
      expect(readFileSyncSpy).toHaveBeenCalledWith(readmePath, 'utf8');
      expect(writeFileSyncSpy).toHaveBeenCalledWith(readmePath, '# title\n[badge]\nfoo');

      expect(consoleLogSpy).toHaveBeenCalledWith('Badge added to the readme file');
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should take the happy path (custom template)', () => {
      expect(() => modifyReadme(readmePath, '[badge]', '# title')).not.toThrow();

      expect(existsSyncSpy).toHaveBeenCalledWith(readmePath);
      expect(readFileSyncSpy).toHaveBeenCalledWith(readmePath, 'utf8');
      expect(writeFileSyncSpy).toHaveBeenCalledWith(readmePath, '[badge]\n![Coverage Badge](https://img.shields.io/badge/coverage-100%25-brightgreen?style=flat)\nfoo');

      expect(consoleLogSpy).toHaveBeenCalledWith('Badge added to the readme file');
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe('warnings', () => {
    it('should warn if no template is found (default template)', () => {
      const badReadmeContent = '# title';
      vol.fromJSON({
        [readmePath]: badReadmeContent,
      });

      expect(() => modifyReadme(readmePath, '')).not.toThrow();

      expect(existsSyncSpy).toHaveBeenCalledWith(readmePath);
      expect(readFileSyncSpy).toHaveBeenCalledWith(readmePath, 'utf8');
      expect(writeFileSyncSpy).toHaveBeenCalledWith(readmePath, badReadmeContent);

      expect(consoleLogSpy).toHaveBeenCalledWith('Badge added to the readme file');
      expect(consoleWarnSpy).toHaveBeenCalledWith('It looks like the readme file doesn\'t have any coverage badge. Did you initialize it?');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should warn if no template is found (custom template)', () => {
      vol.fromJSON({
        [readmePath]: readmeContent,
      });

      expect(() => modifyReadme(readmePath, '', '[badge]')).not.toThrow();

      expect(existsSyncSpy).toHaveBeenCalledWith(readmePath);
      expect(readFileSyncSpy).toHaveBeenCalledWith(readmePath, 'utf8');
      expect(writeFileSyncSpy).toHaveBeenCalledWith(readmePath, readmeContent);

      expect(consoleLogSpy).toHaveBeenCalledWith('Badge added to the readme file');
      expect(consoleWarnSpy).toHaveBeenCalledWith('It looks like the readme file doesn\'t have any coverage badge. Did you initialize it?');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe('errors', () => {
    it('should throw an error if no file found', () => {
      expect(() => modifyReadme(readmePath, '')).toThrow('FileNotFound');

      expect(existsSyncSpy).toHaveBeenCalledWith(readmePath);
      expect(readFileSyncSpy).not.toHaveBeenCalled();
      expect(writeFileSyncSpy).not.toHaveBeenCalled();

      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith('No readme file found at', readmePath);
    });
  });
});

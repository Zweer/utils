import { execSync } from 'node:child_process';

import type { MockInstance } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  checkNpmLogin,
  ensureNpmLogin,
  packageExistsOnNpm,
  publishPackage,
} from '../../lib/npm.js';

vi.mock('node:child_process', () => ({
  execSync: vi.fn(),
}));

describe('lib -> npm', () => {
  let execSyncSpy: MockInstance<typeof execSync>;

  beforeEach(() => {
    execSyncSpy = vi.mocked(execSync);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('checkNpmLogin', () => {
    it('should return the username when logged in', () => {
      execSyncSpy.mockReturnValue('zweer\n');

      expect(checkNpmLogin()).toBe('zweer');
      expect(execSyncSpy).toHaveBeenCalledWith('npm whoami', {
        encoding: 'utf-8',
        stdio: 'pipe',
      });
    });

    it('should return null when not logged in', () => {
      execSyncSpy.mockImplementation(() => {
        throw new Error('ENEEDAUTH');
      });

      expect(checkNpmLogin()).toBeNull();
    });
  });

  describe('ensureNpmLogin', () => {
    it('should return username when already logged in', () => {
      execSyncSpy.mockReturnValue('zweer\n');

      expect(ensureNpmLogin()).toBe('zweer');
    });

    it('should login and return username when not logged in', () => {
      let loginCalled = false;
      execSyncSpy.mockImplementation((cmd: string) => {
        if (cmd === 'npm whoami') {
          if (!loginCalled) throw new Error('ENEEDAUTH');
          return 'zweer\n';
        }
        if (cmd === 'npm login') {
          loginCalled = true;
          return '';
        }
        return '';
      });

      expect(ensureNpmLogin()).toBe('zweer');
      expect(execSyncSpy).toHaveBeenCalledWith('npm login', { stdio: 'inherit' });
    });

    it('should throw when login fails', () => {
      execSyncSpy.mockImplementation((cmd: string) => {
        if (cmd === 'npm whoami') throw new Error('ENEEDAUTH');
        return '';
      });

      expect(() => ensureNpmLogin()).toThrow('npm login failed. Please try again.');
    });
  });

  describe('packageExistsOnNpm', () => {
    it('should return true when the package exists', () => {
      execSyncSpy.mockReturnValue('1.0.0');

      expect(packageExistsOnNpm('@zweer/test-pkg')).toBe(true);
      expect(execSyncSpy).toHaveBeenCalledWith('npm view @zweer/test-pkg version', {
        encoding: 'utf-8',
        stdio: 'pipe',
      });
    });

    it('should return false when the package does not exist', () => {
      execSyncSpy.mockImplementation(() => {
        throw new Error('E404');
      });

      expect(packageExistsOnNpm('@zweer/nonexistent')).toBe(false);
    });
  });

  describe('publishPackage', () => {
    it('should publish with public access', () => {
      execSyncSpy.mockReturnValue('');

      publishPackage('/path/to/pkg', 'public', false);

      expect(execSyncSpy).toHaveBeenCalledWith('npm publish --access public', {
        cwd: '/path/to/pkg',
        stdio: 'inherit',
      });
    });

    it('should publish with restricted access', () => {
      execSyncSpy.mockReturnValue('');

      publishPackage('/path/to/pkg', 'restricted', false);

      expect(execSyncSpy).toHaveBeenCalledWith('npm publish --access restricted', {
        cwd: '/path/to/pkg',
        stdio: 'inherit',
      });
    });

    it('should add --dry-run flag when dryRun is true', () => {
      execSyncSpy.mockReturnValue('');

      publishPackage('/path/to/pkg', 'public', true);

      expect(execSyncSpy).toHaveBeenCalledWith('npm publish --access public --dry-run', {
        cwd: '/path/to/pkg',
        stdio: 'inherit',
      });
    });

    it('should throw when publish fails', () => {
      execSyncSpy.mockImplementation(() => {
        throw new Error('publish failed');
      });

      expect(() => publishPackage('/path/to/pkg', 'public', false)).toThrow('publish failed');
    });
  });
});

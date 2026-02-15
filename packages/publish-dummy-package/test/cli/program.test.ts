import * as childProcess from 'node:child_process';
import process from 'node:process';

import { vol } from 'memfs';
import type { MockInstance } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { buildProgram } from '../../cli/program.js';

const rootPath = vi.hoisted(() => '/fake/root/path');
const packagePath = `${rootPath}/package.json`;

vi.mock('node:fs', async () => {
  const { fs } = await import('memfs');

  return {
    default: fs,
    ...fs,
  };
});

vi.mock('node:child_process', () => ({
  execSync: vi.fn(),
}));

vi.mock(import('node:path'), async (importOriginal) => {
  const path = await importOriginal();

  return {
    ...path,
    join: vi.fn((...args: string[]) => {
      const realRootPath1 = path.dirname(path.dirname(import.meta.dirname));
      if (args[0].startsWith(realRootPath1)) {
        args[0] = args[0].replace(realRootPath1, rootPath);
      }

      const realRootPath2 = path.dirname(
        path.dirname(path.dirname(path.dirname(import.meta.dirname))),
      );
      if (args[0].startsWith(realRootPath2)) {
        args[0] = args[0].replace(realRootPath2, rootPath);
      }

      return path.join(...args);
    }),
  };
});

vi.spyOn(process, 'cwd').mockReturnValue(rootPath);

describe('cli -> program', () => {
  let stdoutSpy: MockInstance<typeof process.stdout.write>;
  let stderrSpy: MockInstance<typeof process.stderr.write>;
  let consoleLogSpy: MockInstance<typeof console.log>;
  let execSyncSpy: MockInstance<typeof childProcess.execSync>;

  const name = '@zweer/publish-dummy-package';
  const expectedName = 'publish-dummy-package';
  const version = '1.0.0';
  const description =
    'A CLI tool to publish dummy packages to npm for OIDC provenance setup in monorepos';

  beforeEach(() => {
    vol.fromJSON({
      [packagePath]: JSON.stringify({ name, version, description }),
    });

    stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit');
    });

    execSyncSpy = vi.mocked(childProcess.execSync);
  });

  afterEach(() => {
    vi.resetAllMocks();
    vol.reset();
  });

  it('should print the help message when unknown option', () => {
    expect(() => buildProgram().exitOverride().parse(['--unknown'], { from: 'user' })).toThrow(
      "error: unknown option '--unknown'",
    );

    expect(stderrSpy).toHaveBeenCalledWith("error: unknown option '--unknown'\n");
  });

  describe('action', () => {
    const actionPkgJson = JSON.stringify({
      name,
      version,
      description,
      workspaces: ['packages/*'],
    });

    it('should login automatically when not logged in to npm', () => {
      vol.fromNestedJSON({
        [rootPath]: {
          'package.json': actionPkgJson,
          packages: {},
        },
      });

      let loginCalled = false;
      execSyncSpy.mockImplementation((cmd: string) => {
        if (cmd === 'npm whoami') {
          if (!loginCalled) throw new Error('ENEEDAUTH');
          return 'zweer';
        }
        if (cmd === 'npm login') {
          loginCalled = true;
          return '';
        }
        return '';
      });

      buildProgram().parse([], { from: 'user' });

      expect(consoleLogSpy).toHaveBeenCalledWith('🔑 Not logged in to npm. Starting login...\n');
      expect(consoleLogSpy).toHaveBeenCalledWith('✅ Logged in as: zweer\n');
    });

    it('should publish unpublished packages using workspaces', () => {
      vol.fromNestedJSON({
        [rootPath]: {
          'package.json': actionPkgJson,
          packages: {
            'pkg-a': {
              'package.json': JSON.stringify({ name: '@zweer/pkg-a', version: '0.0.0' }),
            },
          },
        },
      });

      execSyncSpy.mockImplementation((cmd: string) => {
        if (cmd === 'npm whoami') return 'zweer';
        if ((cmd as string).startsWith('npm view')) throw new Error('E404');
        return '';
      });

      buildProgram().parse([], { from: 'user' });

      expect(consoleLogSpy).toHaveBeenCalledWith('✅ Logged in as: zweer\n');
      expect(consoleLogSpy).toHaveBeenCalledWith('📦  @zweer/pkg-a: published successfully');
      expect(consoleLogSpy).toHaveBeenCalledWith('\n✨ Done!');
    });

    it('should skip packages that already exist on npm', () => {
      vol.fromNestedJSON({
        [rootPath]: {
          'package.json': actionPkgJson,
          packages: {
            'pkg-a': {
              'package.json': JSON.stringify({ name: '@zweer/pkg-a', version: '1.0.0' }),
            },
          },
        },
      });

      execSyncSpy.mockImplementation((cmd: string) => {
        if (cmd === 'npm whoami') return 'zweer';
        if ((cmd as string).startsWith('npm view')) return '1.0.0';
        return '';
      });

      buildProgram().parse([], { from: 'user' });

      expect(consoleLogSpy).toHaveBeenCalledWith('⏭️  @zweer/pkg-a: already exists on npm');
    });

    it('should skip private packages', () => {
      vol.fromNestedJSON({
        [rootPath]: {
          'package.json': actionPkgJson,
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

      execSyncSpy.mockImplementation((cmd: string) => {
        if (cmd === 'npm whoami') return 'zweer';
        return '';
      });

      buildProgram().parse([], { from: 'user' });

      expect(consoleLogSpy).toHaveBeenCalledWith('⏭️  @zweer/pkg-a: private package');
    });

    it('should report failed publishes', () => {
      vol.fromNestedJSON({
        [rootPath]: {
          'package.json': actionPkgJson,
          packages: {
            'pkg-a': {
              'package.json': JSON.stringify({ name: '@zweer/pkg-a', version: '0.0.0' }),
            },
          },
        },
      });

      execSyncSpy.mockImplementation((cmd: string) => {
        if (cmd === 'npm whoami') return 'zweer';
        if ((cmd as string).startsWith('npm view')) throw new Error('E404');
        if ((cmd as string).startsWith('npm publish')) throw new Error('EPERM');
        return '';
      });

      buildProgram().parse([], { from: 'user' });

      expect(consoleLogSpy).toHaveBeenCalledWith('❌  @zweer/pkg-a: EPERM');
    });
  });

  describe('version', () => {
    it.each(['--version', '-V'])('should print the version when "%s"', (versionOption) => {
      expect(() => buildProgram().exitOverride().parse([versionOption], { from: 'user' })).toThrow(
        version,
      );

      expect(stdoutSpy).toHaveBeenCalledWith(`${version}\n`);
    });
  });

  describe('help', () => {
    const help = `Usage: ${expectedName} [options]

A CLI tool to publish dummy packages to npm for OIDC provenance setup in
monorepos

Options:
  -V, --version      output the version number
  --root-dir <PATH>  Root directory of the monorepo (default: "${rootPath}")
  --access <ACCESS>  npm publish access level (default: "public")
  --dry-run          Perform a dry run without publishing (default: false)
  -h, --help         display help for command
`;

    it.each(['--help', '-h'])('should print the help message when "%s"', (helpOption) => {
      expect(() => buildProgram().exitOverride().parse([helpOption], { from: 'user' })).toThrow(
        '(outputHelp)',
      );

      expect(stdoutSpy).toHaveBeenCalledWith(help);
    });
  });
});

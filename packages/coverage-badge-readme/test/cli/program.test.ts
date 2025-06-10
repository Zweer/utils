import type { MockInstance } from 'vitest';

import * as fs from 'node:fs';
import process from 'node:process';

import { vol } from 'memfs';
import { it } from 'vitest';
import { afterEach, beforeEach, describe, expect, vi } from 'vitest';

import { buildProgram } from '../../cli/program.js';

const rootPath = vi.hoisted(() => '/fake/root/path');
const packagePath = `${rootPath}/package.json`;
const readmePath = `${rootPath}/README.md`;
const coveragePath = `${rootPath}/coverage/coverage-summary.json`;

vi.mock('node:fs', async () => {
  const { fs } = await import('memfs');

  return {
    default: fs,
    ...fs,
  };
});

vi.mock(import('node:path'), async (importOriginal) => {
  const path = await importOriginal();

  return {
    ...path,
    join: vi.fn((...args: string[]) => {
      const realRootPath = path.dirname(path.dirname(import.meta.dirname));
      if (args[0].startsWith(realRootPath)) {
        args[0] = args[0].replace(realRootPath, rootPath);
      }

      return path.join(...args);
    }),
  };
});

vi.spyOn(process, 'cwd').mockReturnValue(rootPath);

describe('cli -> program', () => {
  let stdoutSpy: MockInstance<typeof process.stdout.write>;
  let stderrSpy: MockInstance<typeof process.stderr.write>;

  let existsSyncSpy: MockInstance<typeof fs.existsSync>;
  let readFileSyncSpy: MockInstance<typeof fs.readFileSync>;
  let writeFileSyncSpy: MockInstance<typeof fs.writeFileSync>;

  const name = '@zweer/coverage-badge-readme';
  const expectedName = 'coverage-badge-readme';
  const version = '1.2.3';
  const description = 'A small utility to add your coverage badge to the README file';

  beforeEach(() => {
    vol.fromJSON({
      [packagePath]: JSON.stringify({ name, version, description }),
    });

    stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);

    existsSyncSpy = vi.spyOn(fs, 'existsSync');
    readFileSyncSpy = vi.spyOn(fs, 'readFileSync');
    writeFileSyncSpy = vi.spyOn(fs, 'writeFileSync');
  });

  afterEach(() => {
    vi.resetAllMocks();
    vol.reset();
  });

  it('should print the help message when unknown option', () => {
    expect(() => buildProgram().exitOverride().parse(['--unknown'], { from: 'user' }))
      .toThrow('error: unknown option \'--unknown\'');

    expect(stdoutSpy).not.toHaveBeenCalled();
    expect(stderrSpy).toHaveBeenCalledWith('error: unknown option \'--unknown\'\n');

    expect(existsSyncSpy).not.toHaveBeenCalled();
    expect(readFileSyncSpy).toHaveBeenCalledWith(packagePath, 'utf8');
    expect(writeFileSyncSpy).not.toHaveBeenCalled();
  });

  describe('action', () => {
    const readmeContent = '# title\n![Coverage Badge](https://img.shields.io/badge/coverage-100%25-brightgreen?style=flat)\nfoo';
    const expectedReadmeContent = '# title\n![Coverage Badge](https://img.shields.io/badge/coverage-40%25-red?style=flat)\nfoo';

    const branchesPct = 10;
    const branchesTruePct = 20;
    const functionsPct = 30;
    const linesPct = 40;
    const statementsPct = 50;

    const coverage = {
      total: {
        branches: {
          covered: branchesPct,
          pct: branchesPct,
          skipped: 0,
          total: 100,
        },
        branchesTrue: {
          covered: branchesTruePct,
          pct: branchesTruePct,
          skipped: 0,
          total: 100,
        },
        functions: {
          covered: functionsPct,
          pct: functionsPct,
          skipped: 0,
          total: 100,
        },
        lines: {
          covered: linesPct,
          pct: linesPct,
          skipped: 0,
          total: 100,
        },
        statements: {
          covered: statementsPct,
          pct: statementsPct,
          skipped: 0,
          total: 100,
        },
      },
    };

    beforeEach(() => {
      vol.fromJSON({
        [packagePath]: JSON.stringify({ name, version, description }),
        [readmePath]: readmeContent,
        [coveragePath]: JSON.stringify(coverage),
      });
    });

    it('should take the happy path and generate the new readme file', () => {
      buildProgram().parse([], { from: 'user' });

      expect(stdoutSpy).not.toHaveBeenCalled();
      expect(stderrSpy).not.toHaveBeenCalled();

      expect(existsSyncSpy).toHaveBeenCalledTimes(2);
      expect(readFileSyncSpy).toHaveBeenCalledTimes(3);
      expect(readFileSyncSpy).toHaveBeenCalledWith(packagePath, 'utf8');
      expect(readFileSyncSpy).toHaveBeenCalledWith(readmePath, 'utf8');
      expect(readFileSyncSpy).toHaveBeenCalledWith(coveragePath, 'utf8');
      expect(writeFileSyncSpy).toHaveBeenCalledTimes(1);
      expect(writeFileSyncSpy).toHaveBeenCalledWith(readmePath, expectedReadmeContent);
    });
  });

  describe('version', () => {
    it.each(['--version', '-V'])('should print the version when "%s"', (versionOption) => {
      expect(() => buildProgram().exitOverride().parse([versionOption], { from: 'user' }))
        .toThrow(version);

      expect(stdoutSpy).toHaveBeenCalledWith(`${version}\n`);
      expect(stderrSpy).not.toHaveBeenCalled();

      expect(existsSyncSpy).not.toHaveBeenCalled();
      expect(readFileSyncSpy).toHaveBeenCalledWith(packagePath, 'utf8');
      expect(writeFileSyncSpy).not.toHaveBeenCalled();
    });
  });

  describe('help', () => {
    const help = `Usage: ${expectedName} [options]

${description}

Options:
  -V, --version           output the version number
  --readme-path <PATH>    The path of the README file (default:
                          \"/fake/root/path/README.md\")
  --coverage-path <PATH>  The path of the coverage-summary.json file (default:
                          \"/fake/root/path/coverage/coverage-summary.json\")
  -h, --help              display help for command
`;

    it.each(['--help', '-h'])('should print the help message when "%s"', (helpOption) => {
      expect(() => buildProgram().exitOverride().parse([helpOption], { from: 'user' }))
        .toThrow('(outputHelp)');

      expect(stdoutSpy).toHaveBeenCalledWith(help);
      expect(stderrSpy).not.toHaveBeenCalled();

      expect(existsSyncSpy).not.toHaveBeenCalled();
      expect(readFileSyncSpy).toHaveBeenCalledWith(packagePath, 'utf8');
      expect(writeFileSyncSpy).not.toHaveBeenCalled();
    });
  });
});

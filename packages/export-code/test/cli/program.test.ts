import type { MockInstance } from 'vitest';

import * as fs from 'node:fs';
import process from 'node:process';

import { vol } from 'memfs';
import { it } from 'vitest';
import { afterEach, beforeEach, describe, expect, vi } from 'vitest';

import { buildProgram } from '../../cli/program.js';

const rootPath = process.cwd();

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
      const realRootPath1 = path.dirname(path.dirname(import.meta.dirname));
      if (args[0].startsWith(realRootPath1)) {
        args[0] = args[0].replace(realRootPath1, rootPath);
      }

      const realRootPath2 = path.dirname(path.dirname(path.dirname(path.dirname(import.meta.dirname))));
      if (args[0].startsWith(realRootPath2)) {
        args[0] = args[0].replace(realRootPath2, rootPath);
      }

      return path.join(...args);
    }),
  };
});

describe('cli -> program', () => {
  let stdoutSpy: MockInstance<typeof process.stdout.write>;
  let stderrSpy: MockInstance<typeof process.stderr.write>;

  let existsSyncSpy: MockInstance<typeof fs.existsSync>;
  let readFileSyncSpy: MockInstance<typeof fs.readFileSync>;
  let writeFileSyncSpy: MockInstance<typeof fs.writeFileSync>;

  const packagePath = 'package.json';
  const name = '@zweer/export-code';
  const expectedName = 'export-code';
  const version = '1.2.3';
  const description = 'A small utility to export all the repo code into a single md file';

  beforeEach(() => {
    vol.fromNestedJSON({
      [rootPath]: {
        [packagePath]: JSON.stringify({ name, version, description }),
      },
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
    expect(readFileSyncSpy).toHaveBeenCalledWith(`${rootPath}/${packagePath}`, 'utf8');
    expect(writeFileSyncSpy).not.toHaveBeenCalled();
  });

  describe('action', () => {
    const exportPath = `${rootPath}/docs/EXPORT.md`;

    beforeEach(() => {
      vol.fromNestedJSON({
        [rootPath]: {
          [packagePath]: JSON.stringify({ name, version, description }),
          'a.ts': 'console.log(1);',
          'README.md': '# Foo',
          '.gitignore': '',
        },
      });
    });

    it('should take the happy path and generate the new readme file', () => {
      buildProgram().parse([], { from: 'user' });

      expect(stdoutSpy).not.toHaveBeenCalled();
      expect(stderrSpy).not.toHaveBeenCalled();

      expect(existsSyncSpy).toHaveBeenCalledTimes(2);
      expect(readFileSyncSpy).toHaveBeenCalledTimes(6);
      expect(readFileSyncSpy).toHaveBeenCalledWith(`${rootPath}/${packagePath}`, 'utf8');
      expect(writeFileSyncSpy).toHaveBeenCalledTimes(1);
      expect(writeFileSyncSpy).toHaveBeenCalledWith(exportPath, expect.any(String));

      const output = vol.readFileSync(exportPath, 'utf8') as string;
      expect(output).toMatchSnapshot();
    });
  });

  describe('version', () => {
    it.each(['--version', '-V'])('should print the version when "%s"', (versionOption) => {
      expect(() => buildProgram().exitOverride().parse([versionOption], { from: 'user' }))
        .toThrow(version);

      expect(stdoutSpy).toHaveBeenCalledWith(`${version}\n`);
      expect(stderrSpy).not.toHaveBeenCalled();

      expect(existsSyncSpy).not.toHaveBeenCalled();
      expect(readFileSyncSpy).toHaveBeenCalledWith(`${rootPath}/${packagePath}`, 'utf8');
      expect(writeFileSyncSpy).not.toHaveBeenCalled();
    });
  });

  describe('help', () => {
    const help = `Usage: ${expectedName} [options]

${description}

Options:
  -V, --version         output the version number
  --export-path <PATH>  The path of the EXPORT file (default:
                        \"${rootPath}/docs/EXPORT.md\")
  -h, --help            display help for command
`;

    it.each(['--help', '-h'])('should print the help message when "%s"', (helpOption) => {
      expect(() => buildProgram().exitOverride().parse([helpOption], { from: 'user' }))
        .toThrow('(outputHelp)');

      expect(stdoutSpy).toHaveBeenCalledWith(help);
      expect(stderrSpy).not.toHaveBeenCalled();

      expect(existsSyncSpy).not.toHaveBeenCalled();
      expect(readFileSyncSpy).toHaveBeenCalledWith(`${rootPath}/${packagePath}`, 'utf8');
      expect(writeFileSyncSpy).not.toHaveBeenCalled();
    });
  });
});

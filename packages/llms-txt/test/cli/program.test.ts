import process from 'node:process';

import { vol } from 'memfs';
import type { MockInstance } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { buildProgram } from '../../cli/program.js';

const rootPath = vi.hoisted(() => '/fake/root/path');
const packagePath = `${rootPath}/package.json`;
const outDir = `${rootPath}/docs/public`;

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
  let consoleLogSpy: MockInstance<typeof console.log>;

  const name = '@zweer/llms-txt';
  const expectedName = 'llms-txt';
  const version = '1.0.0';
  const description =
    'A CLI tool to generate llms.txt and llms-full.txt files from a VitePress docs directory';

  beforeEach(() => {
    vol.fromJSON({
      [packagePath]: JSON.stringify({ name, version, description }),
    });

    stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.resetAllMocks();
    vol.reset();
  });

  it('should error when required options are missing', () => {
    expect(() => buildProgram().exitOverride().parse([], { from: 'user' })).toThrow(
      "required option '--project-name <NAME>' not specified",
    );
  });

  describe('action', () => {
    beforeEach(() => {
      vol.fromNestedJSON({
        [rootPath]: {
          'package.json': JSON.stringify({ name, version, description }),
          docs: {
            'index.md': '---\ntitle: Home\ndescription: Welcome\n---\n# Home\nContent.',
            guide: {
              'setup.md':
                '---\ntitle: Setup\ndescription: How to set up\n---\n# Setup\nSetup content.',
            },
            public: {},
          },
        },
      });
    });

    it('should generate both llms.txt and llms-full.txt', () => {
      buildProgram().parse(
        [
          '--project-name',
          'Test Project',
          '--project-description',
          'A test project',
          '--site-url',
          'https://test.com',
        ],
        { from: 'user' },
      );

      expect(consoleLogSpy).toHaveBeenCalledWith('✅ Generated: llms.txt');
      expect(consoleLogSpy).toHaveBeenCalledWith('✅ Generated: llms-full.txt');

      const llmsTxt = vol.readFileSync(`${outDir}/llms.txt`, 'utf8') as string;
      expect(llmsTxt).toContain('# Test Project');
      expect(llmsTxt).toContain('> A test project');
      expect(llmsTxt).toContain('[Home](https://test.com/): Welcome');
      expect(llmsTxt).toContain('[Setup](https://test.com/guide/setup): How to set up');

      const llmsFullTxt = vol.readFileSync(`${outDir}/llms-full.txt`, 'utf8') as string;
      expect(llmsFullTxt).toContain('# Test Project');
      expect(llmsFullTxt).toContain('# Home\nContent.');
      expect(llmsFullTxt).toContain('# Setup\nSetup content.');
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

A CLI tool to generate llms.txt and llms-full.txt files from a VitePress docs
directory

Options:
  -V, --version                 output the version number
  --project-name <NAME>         Project name for the llms.txt header
  --project-description <DESC>  Project description
  --site-url <URL>              Base URL of the site (e.g., https://example.com)
  --docs-dir <PATH>             Path to the docs directory (default:
                                "${rootPath}/docs")
  --out-dir <PATH>              Output directory for generated files (default:
                                "${rootPath}/docs/public")
  -h, --help                    display help for command
`;

    it.each(['--help', '-h'])('should print the help message when "%s"', (helpOption) => {
      expect(() => buildProgram().exitOverride().parse([helpOption], { from: 'user' })).toThrow(
        '(outputHelp)',
      );

      expect(stdoutSpy).toHaveBeenCalledWith(help);
    });
  });
});

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

  describe('action', () => {
    const actionPkgJson = JSON.stringify({
      name,
      version,
      description,
      repository: { type: 'git', url: 'git+https://github.com/Zweer/my-project.git' },
    });

    it('should exit when project name cannot be determined', () => {
      vol.fromNestedJSON({
        [rootPath]: {
          'package.json': JSON.stringify({ name: '', version, description }),
          docs: { public: {} },
        },
      });

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit');
      });

      expect(() => buildProgram().parse([], { from: 'user' })).toThrow('process.exit');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '❌ Could not determine project name. Use --project-name or set name in package.json.',
      );
      expect(exitSpy).toHaveBeenCalledWith(1);
    });

    it('should auto-detect project meta from package.json', () => {
      vol.fromNestedJSON({
        [rootPath]: {
          'package.json': actionPkgJson,
          docs: {
            'index.md': '---\ntitle: Home\ndescription: Welcome\n---\n# Home\nContent.',
            public: {},
          },
        },
      });

      buildProgram().parse([], { from: 'user' });

      expect(consoleLogSpy).toHaveBeenCalledWith('✅ Generated: llms.txt');
      expect(consoleLogSpy).toHaveBeenCalledWith('✅ Generated: llms-full.txt');

      const llmsTxt = vol.readFileSync(`${outDir}/llms.txt`, 'utf8') as string;
      expect(llmsTxt).toContain('# llms-txt');
      expect(llmsTxt).toContain(`> ${description}`);
      expect(llmsTxt).toContain('https://zweer.github.io/my-project');
    });

    it('should allow CLI options to override package.json', () => {
      vol.fromNestedJSON({
        [rootPath]: {
          'package.json': actionPkgJson,
          docs: {
            'index.md': '# Home',
            public: {},
          },
        },
      });

      buildProgram().parse(
        [
          '--project-name',
          'Custom Name',
          '--project-description',
          'Custom desc',
          '--site-url',
          'https://custom.com',
        ],
        { from: 'user' },
      );

      const llmsTxt = vol.readFileSync(`${outDir}/llms.txt`, 'utf8') as string;
      expect(llmsTxt).toContain('# Custom Name');
      expect(llmsTxt).toContain('> Custom desc');
      expect(llmsTxt).toContain('https://custom.com');
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
  --project-name <NAME>         Project name (default: from package.json name)
  --project-description <DESC>  Project description (default: from package.json)
  --site-url <URL>              Base URL of the site (default: GitHub Pages from
                                repo URL)
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

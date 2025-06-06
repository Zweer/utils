import type { MockInstance } from 'vitest';

import * as fs from 'node:fs';

import { beforeEach, describe, expect, it, vi } from 'vitest';

let mockReadFileContents: Record<string, string> = {};
let mockWrittenFileContent = '';
const mockCurrentFolder = '/fake/project/path';

vi.mock('node:fs', () => ({
  readFileSync: vi.fn((path: string, encoding: string) => {
    if (path in mockReadFileContents) {
      expect(encoding).toBe('utf8');
      return mockReadFileContents[path];
    }
    throw new Error(`Mock Error: File not found at ${path}`);
  }),

  writeFileSync: vi.fn((path: string, data: string) => {
    mockWrittenFileContent = data;
  }),
}));

const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
const processExitSpy = vi.spyOn(process, 'exit').mockReturnValue({} as never);
const processCwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(mockCurrentFolder);

async function runScript() {
  await import('./readme-coverage.js');
}

const readmePath = `${mockCurrentFolder}/README.md`;
const coveragePath = `${mockCurrentFolder}/coverage/coverage-summary.json`;

const initialReadmeContent = `Some initial text.
![Coverage Badge](https://img.shields.io/badge/coverage-0%25-grey?style=flat)
Some final text.`;

describe('script -> readme coverage', () => {
  let readFileSync: MockInstance<typeof fs.readFileSync>;
  let writeFileSync: MockInstance<typeof fs.writeFileSync>;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    readFileSync = vi.mocked(fs.readFileSync);
    writeFileSync = vi.mocked(fs.writeFileSync);

    mockReadFileContents = {};
    mockWrittenFileContent = '';
    processCwdSpy.mockReturnValue(mockCurrentFolder);
  });

  it('should update README with brightgreen badge for >98% coverage', async () => {
    mockReadFileContents[coveragePath] = JSON.stringify({
      total: { lines: { pct: 99.5 } },
    });
    mockReadFileContents[readmePath] = initialReadmeContent;

    await runScript();

    expect(readFileSync).toHaveBeenCalledWith(coveragePath, 'utf8');
    expect(readFileSync).toHaveBeenCalledWith(readmePath, 'utf8');

    expect(writeFileSync).toHaveBeenCalledTimes(1);
    expect(writeFileSync).toHaveBeenCalledWith(
      readmePath,
      `Some initial text.
![Coverage Badge](https://img.shields.io/badge/coverage-100%25-brightgreen?style=flat)
Some final text.`,
    );

    expect(consoleLogSpy).toHaveBeenCalledWith('README.md file successfully written');

    expect(processExitSpy).not.toHaveBeenCalled();
  });

  it('should update README with red badge for 0% coverage', async () => {
    mockReadFileContents[coveragePath] = JSON.stringify({
      total: { lines: { pct: 0 } },
    });
    mockReadFileContents[readmePath] = initialReadmeContent;

    await runScript();

    expect(readFileSync).toHaveBeenCalledWith(coveragePath, 'utf8');
    expect(readFileSync).toHaveBeenCalledWith(readmePath, 'utf8');

    expect(writeFileSync).toHaveBeenCalledTimes(1);
    expect(writeFileSync).toHaveBeenCalledWith(
      readmePath,
      `Some initial text.
![Coverage Badge](https://img.shields.io/badge/coverage-0%25-red?style=flat)
Some final text.`,
    );
    expect(mockWrittenFileContent).toContain('coverage-0%25-red');

    expect(consoleLogSpy).toHaveBeenCalledWith('README.md file successfully written');

    expect(processExitSpy).not.toHaveBeenCalled();
  });

  const colorTestCases = [
    { pctInput: 100, roundedCoverage: 100, expectedColor: 'brightgreen', description: '100% is brightgreen' },
    { pctInput: 98.5, roundedCoverage: 99, expectedColor: 'brightgreen', description: '98.5% (rounds to 99) is brightgreen' },
    { pctInput: 98.4, roundedCoverage: 98, expectedColor: 'green', description: '98.4% (rounds to 98) is green' },
    { pctInput: 95.5, roundedCoverage: 96, expectedColor: 'green', description: '95.5% (rounds to 96) is green' },
    { pctInput: 95.4, roundedCoverage: 95, expectedColor: 'yellow', description: '95.4% (rounds to 95) is yellow' },
    { pctInput: 90.5, roundedCoverage: 91, expectedColor: 'yellow', description: '90.5% (rounds to 91) is yellow' },
    { pctInput: 90.4, roundedCoverage: 90, expectedColor: 'yellowgreen', description: '90.4% (rounds to 90) is yellowgreen' },
    { pctInput: 80.5, roundedCoverage: 81, expectedColor: 'yellowgreen', description: '80.5% (rounds to 81) is yellowgreen' },
    { pctInput: 80.4, roundedCoverage: 80, expectedColor: 'orange', description: '80.4% (rounds to 80) is orange' }, // Errore nel mio ragionamento: 80 > 50, quindi orange
    { pctInput: 50.5, roundedCoverage: 51, expectedColor: 'orange', description: '50.5% (rounds to 51) is orange' },
    { pctInput: 50.4, roundedCoverage: 50, expectedColor: 'red', description: '50.4% (rounds to 50) is red' },
    { pctInput: 0, roundedCoverage: 0, expectedColor: 'red', description: '0% is red' },
    { pctInput: -10, roundedCoverage: -10, expectedColor: 'grey', description: '-10% is grey' },
  ];

  colorTestCases.forEach(({ pctInput, roundedCoverage, expectedColor, description }) => {
    it(`should use ${expectedColor} for ${description}`, async () => {
      mockReadFileContents[coveragePath] = JSON.stringify({
        total: { lines: { pct: pctInput } },
      });
      mockReadFileContents[readmePath] = initialReadmeContent;

      await runScript();

      expect(readFileSync).toHaveBeenCalledWith(coveragePath, 'utf8');
      expect(readFileSync).toHaveBeenCalledWith(readmePath, 'utf8');

      expect(writeFileSync).toHaveBeenCalledTimes(1);
      expect(writeFileSync).toHaveBeenCalledWith(
        readmePath,
        `Some initial text.
![Coverage Badge](https://img.shields.io/badge/coverage-${roundedCoverage}%25-${expectedColor}?style=flat)
Some final text.`,
      );
      expect(mockWrittenFileContent).toContain(`coverage-${roundedCoverage}%25-${expectedColor}`);

      expect(consoleLogSpy).toHaveBeenCalledWith('README.md file successfully written');

      expect(processExitSpy).not.toHaveBeenCalled();
    });
  });

  describe('errors', () => {
    it('should log an error and exit if badge is not found in README', async () => {
      mockReadFileContents[coveragePath] = JSON.stringify({
        total: { lines: { pct: 75 } },
      });
      mockReadFileContents[readmePath] = 'This README does not contain the coverage badge.';

      await runScript();

      expect(writeFileSync).not.toHaveBeenCalled();

      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Badge image not found in the README.md file');

      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle error if coverage-summary.json is not found (mock throws)', async () => {
      mockReadFileContents[readmePath] = initialReadmeContent;

      await expect(runScript()).rejects.toThrow('Mock Error: File not found at /fake/project/path/coverage/coverage-summary.json');

      expect(writeFileSync).not.toHaveBeenCalled();

      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();

      expect(processExitSpy).not.toHaveBeenCalled();
    });

    it('should handle error if README.md is not found (mock throws during initial read)', async () => {
      mockReadFileContents[coveragePath] = JSON.stringify({
        total: { lines: { pct: 75 } },
      });

      await expect(runScript()).rejects.toThrow('Mock Error: File not found at /fake/project/path/README.md');

      expect(writeFileSync).not.toHaveBeenCalled();

      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();

      expect(processExitSpy).not.toHaveBeenCalled();
    });
  });
});

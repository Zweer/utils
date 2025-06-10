import type { MockInstance } from 'vitest';

import * as fs from 'node:fs';

import { vol } from 'memfs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { extractCoverage } from '../../lib/coverage.js';
import { CoverageMetric } from '../../lib/types.js';

vi.mock('node:fs', async () => {
  const { fs } = await import('memfs');

  return {
    default: fs,
    ...fs,
  };
});

const rootFolder = '/fake/root/folder';
const coveragePath = `${rootFolder}/coverage/coverage.txt`;

describe('lib -> coverage', () => {
  let consoleLogSpy: MockInstance<typeof console.log>;
  let consoleErrorSpy: MockInstance<typeof console.error>;

  let existsSyncSpy: MockInstance<typeof fs.existsSync>;
  let readFileSyncSpy: MockInstance<typeof fs.readFileSync>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    existsSyncSpy = vi.spyOn(fs, 'existsSync');
    readFileSyncSpy = vi.spyOn(fs, 'readFileSync');
  });

  afterEach(() => {
    vi.resetAllMocks();
    vol.reset();
  });

  it('should fail if no coverage file is found', () => {
    expect(() => extractCoverage(coveragePath, CoverageMetric.BRANCHES)).toThrow(new Error('FileNotFound'));

    expect(existsSyncSpy).toHaveBeenCalledWith(coveragePath);
    expect(readFileSyncSpy).not.toHaveBeenCalled();
    expect(consoleLogSpy).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith('No coverage file found at', coveragePath);
  });

  describe('there is the coverage file', () => {
    const branchesPct = 10;
    const branchesTruePct = 20;
    const functionsPct = 30;
    const linesPct = 40;
    const statementsPct = 50;

    beforeEach(() => {
      vol.fromJSON({
        [coveragePath]: JSON.stringify({
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
        }),
      });
    });

    it.each([
      { metric: CoverageMetric.BRANCHES, expected: branchesPct },
      { metric: CoverageMetric.BRANCHES_TRUE, expected: branchesTruePct },
      { metric: CoverageMetric.FUNCTIONS, expected: functionsPct },
      { metric: CoverageMetric.LINES, expected: linesPct },
      { metric: CoverageMetric.STATEMENTS, expected: statementsPct },
    ])('should handle every metric: $metric', ({ metric, expected }) => {
      expect(extractCoverage(coveragePath, metric)).toBe(expected);

      expect(existsSyncSpy).toHaveBeenCalledWith(coveragePath);
      expect(readFileSyncSpy).toHaveBeenCalledWith(coveragePath, 'utf8');
      expect(consoleLogSpy).toHaveBeenCalledWith('Coverage percentage found:', expected);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    describe('errors', () => {
      it('should fail when called with the wrong argument', () => {
        expect(() => extractCoverage(coveragePath, 'foo' as CoverageMetric)).toThrow(new Error('CoverageMetric'));

        expect(existsSyncSpy).not.toHaveBeenCalled();
        expect(readFileSyncSpy).not.toHaveBeenCalled();
        expect(consoleLogSpy).not.toHaveBeenCalled();
        expect(consoleErrorSpy).toHaveBeenCalledWith('"foo" has an invalid value. It must be one of the CoverageMetrics');
      });

      it('should fail when called with the wrong coverage file', () => {
        vol.fromJSON({
          [coveragePath]: 'aaa',
        });

        expect(() => extractCoverage(coveragePath, CoverageMetric.BRANCHES)).toThrow(new Error('InvalidCoverageFile'));

        expect(existsSyncSpy).toHaveBeenCalledWith(coveragePath);
        expect(readFileSyncSpy).toHaveBeenCalledWith(coveragePath, 'utf8');
        expect(consoleLogSpy).not.toHaveBeenCalled();
        expect(consoleErrorSpy).toHaveBeenCalledWith('Invalid coverage file at', coveragePath, 'did you specify the "json-summary" reporter?');
      });

      it.each([
        { coverageJson: '', description: 'nullable value' },
        { coverageJson: {}, description: 'no total' },
        { coverageJson: { total: {} }, description: 'no branches' },
        { coverageJson: { total: { branches: {} } }, description: 'no no pct' },
        { coverageJson: { total: { branches: { pct: '' } } }, description: 'pct is not a number' },
      ])('should handle an invalid json: $description', ({ coverageJson }) => {
        vol.fromJSON({
          [coveragePath]: JSON.stringify(coverageJson),
        });

        expect(() => extractCoverage(coveragePath, CoverageMetric.BRANCHES)).toThrow(new Error('InvalidCoverageJsonFile'));

        expect(existsSyncSpy).toHaveBeenCalledWith(coveragePath);
        expect(readFileSyncSpy).toHaveBeenCalledWith(coveragePath, 'utf8');
        expect(consoleLogSpy).not.toHaveBeenCalled();
        expect(consoleErrorSpy).toHaveBeenCalledWith('Invalid coverage json file at', coveragePath, 'did you specify the "json-summary" reporter?');
      });
    });
  });
});
